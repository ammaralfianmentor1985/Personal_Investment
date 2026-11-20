#!/usr/bin/env python3
"""Risk and position-size calculator for the trading agent.

All money maths uses Decimal, so cents are exact (no floating-point drift).
Prices are in the quote currency (USD); money at risk is in USD.

Examples:
  python tools/calc.py risk --entry 3571.302 --stop 3551.248 --target 3600.662 --lot 0.01 0.02 0.10
  python tools/calc.py max-stop --lot 0.05 --risk 10
  python tools/calc.py max-lot --stop-distance 20.054 --risk 10
  python tools/calc.py check --entry 3571.302 --stop 3569.302 --target 3575.302 --lot 0.05 --losses-today 0

Spread handling (optional --spread, in price units): the trade is treated as
paying the spread once, so it is added to the stop distance and subtracted
from the target distance. This is an approximation; real fills can differ.
"""
from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from decimal import ROUND_DOWN, ROUND_HALF_UP, Decimal, InvalidOperation
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPECS_PATH = ROOT / "instruments" / "specs.json"
LIMITS_PATH = ROOT / "risk" / "limits.json"
LIMITS_EXAMPLE_PATH = ROOT / "risk" / "limits.example.json"

CENT = Decimal("0.01")
MILLI = Decimal("0.001")


def D(value) -> Decimal:
    """Convert to Decimal via str so 0.05 stays exactly 0.05."""
    try:
        return Decimal(str(value))
    except InvalidOperation as exc:
        raise ValueError(f"Not a number: {value!r}") from exc


def money(value: Decimal) -> Decimal:
    return value.quantize(CENT, rounding=ROUND_HALF_UP)


def load_spec(symbol: str, specs_path: Path = SPECS_PATH) -> dict:
    specs = json.loads(Path(specs_path).read_text())
    key = symbol.upper()
    if key not in specs or key.startswith("_"):
        raise ValueError(f"Unknown symbol {symbol!r}. Add it to instruments/specs.json first.")
    spec = specs[key]
    if spec.get("contract_size") in (None, ""):
        raise ValueError(
            f"Contract size for {key} is not set. Look it up in your broker's symbol "
            "specification and add it to instruments/specs.json before calculating money."
        )
    return spec


@dataclass(frozen=True)
class RiskResult:
    direction: str
    lot: Decimal
    stop_distance: Decimal
    risk_usd: Decimal
    stop_pct: Decimal
    target_distance: Decimal | None = None
    reward_usd: Decimal | None = None
    rr: Decimal | None = None
    target_pct: Decimal | None = None


def trade_risk(entry, stop, lot, target=None, contract_size=100, spread=0) -> RiskResult:
    """Money at risk and reward for one trade. Direction is inferred from the stop."""
    entry, stop, lot, cs, spread = D(entry), D(stop), D(lot), D(contract_size), D(spread)
    if entry <= 0 or stop <= 0:
        raise ValueError("Prices must be positive.")
    if entry == stop:
        raise ValueError("Entry and stop are the same price.")
    if lot <= 0:
        raise ValueError("Lot size must be positive.")
    if spread < 0:
        raise ValueError("Spread cannot be negative.")

    direction = "long" if stop < entry else "short"
    stop_distance = abs(entry - stop)
    risk_distance = stop_distance + spread
    risk_usd = money(risk_distance * cs * lot)
    stop_pct = (stop_distance / entry * 100).quantize(MILLI, rounding=ROUND_HALF_UP)

    if target is None:
        return RiskResult(direction, lot, stop_distance, risk_usd, stop_pct)

    target = D(target)
    if direction == "long" and target <= entry:
        raise ValueError("For a long (stop below entry) the target must be above entry.")
    if direction == "short" and target >= entry:
        raise ValueError("For a short (stop above entry) the target must be below entry.")
    target_distance = abs(target - entry)
    reward_distance = target_distance - spread
    reward_usd = money(reward_distance * cs * lot)
    rr = (reward_distance / risk_distance).quantize(CENT, rounding=ROUND_HALF_UP)
    target_pct = (target_distance / entry * 100).quantize(MILLI, rounding=ROUND_HALF_UP)
    return RiskResult(
        direction, lot, stop_distance, risk_usd, stop_pct,
        target_distance, reward_usd, rr, target_pct,
    )


def max_stop_distance(lot, risk_usd, contract_size=100, spread=0) -> Decimal:
    """Widest stop (price distance) that keeps the loss within risk_usd. Rounded down."""
    lot, risk_usd, cs, spread = D(lot), D(risk_usd), D(contract_size), D(spread)
    if lot <= 0 or risk_usd <= 0:
        raise ValueError("Lot and risk must be positive.")
    distance = risk_usd / (cs * lot) - spread
    if distance <= 0:
        return Decimal("0.00")
    return distance.quantize(CENT, rounding=ROUND_DOWN)


def max_lot(stop_distance, risk_usd, contract_size=100, min_lot="0.01", lot_step="0.01", spread=0):
    """Largest lot that keeps the loss within risk_usd, rounded down to the lot step.

    Returns None when even the minimum lot would risk too much (= no trade).
    """
    stop_distance, risk_usd, cs = D(stop_distance), D(risk_usd), D(contract_size)
    min_lot, lot_step, spread = D(min_lot), D(lot_step), D(spread)
    if stop_distance <= 0 or risk_usd <= 0:
        raise ValueError("Stop distance and risk must be positive.")
    raw = risk_usd / ((stop_distance + spread) * cs)
    steps = (raw / lot_step).to_integral_value(rounding=ROUND_DOWN)
    lot = (steps * lot_step).quantize(lot_step)
    return lot if lot >= min_lot else None


def load_limits(path: Path = LIMITS_PATH) -> dict:
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(
            f"{path} not found. Copy {LIMITS_EXAMPLE_PATH.name} to limits.json "
            "in the risk folder and fill in your own numbers."
        )
    return json.loads(path.read_text())


def check_trade(entry, stop, lot, limits: dict, target=None, contract_size=100,
                losses_today=0, spread=0):
    """Validate a planned trade against personal limits.

    Returns (verdict, findings) where verdict is PASS, WARN or FAIL and findings is a
    list of (level, message) tuples.
    """
    findings: list[tuple[str, str]] = []
    result = trade_risk(entry, stop, lot, target=target, contract_size=contract_size, spread=spread)
    lot_d = D(lot)

    allowed = {D(x) for x in limits.get("allowed_lots", [])}
    exceptions = {D(x) for x in limits.get("exception_lots", [])}
    if lot_d in allowed:
        findings.append(("OK", f"Lot {lot_d} is one of your standard sizes."))
    elif lot_d in exceptions:
        findings.append(("WARN", f"Lot {lot_d} is an exception size: only for setups that need a wider stop."))
    else:
        findings.append(("FAIL", f"Lot {lot_d} is not in your allowed sizes {sorted(allowed | exceptions)}."))

    normal = D(limits["normal_risk_usd"])
    hard = D(limits["max_risk_usd"])
    if result.risk_usd > hard:
        findings.append(("FAIL", f"Risk ${result.risk_usd} is above your hard cap of ${hard}."))
    elif result.risk_usd > normal:
        findings.append(("WARN", f"Risk ${result.risk_usd} is above your normal ${normal} (hard cap ${hard})."))
    else:
        findings.append(("OK", f"Risk ${result.risk_usd} is within your normal ${normal}."))

    loss_limit = limits.get("daily_loss_count_limit")
    if loss_limit is not None and int(losses_today) >= int(loss_limit):
        findings.append(("FAIL", f"{losses_today} losses today: your rule is to stop after {loss_limit}."))

    min_rr = limits.get("min_rr")
    if result.rr is None:
        findings.append(("WARN", "No target given, so reward-to-risk cannot be checked."))
    elif min_rr is not None and result.rr < D(min_rr):
        findings.append(("FAIL", f"Reward-to-risk {result.rr} is below your minimum {min_rr}."))
    else:
        findings.append(("OK", f"Reward-to-risk {result.rr}."))

    levels = {level for level, _ in findings}
    verdict = "FAIL" if "FAIL" in levels else "WARN" if "WARN" in levels else "PASS"
    return verdict, findings, result


# ---------------------------------------------------------------- CLI

def _print_risk(symbol: str, spec: dict, results: list[RiskResult], spread) -> None:
    first = results[0]
    verified = "" if spec.get("verified") else "  [contract size NOT yet verified in your terminal]"
    print(f"{symbol.upper()} {first.direction}  (contract {spec['contract_size']} {spec.get('unit', '')} per 1.00 lot, "
          f"spread {D(spread)}){verified}")
    print(f"Stop distance : {first.stop_distance}  ({first.stop_pct}% of entry)")
    if first.target_distance is not None:
        print(f"Target dist.  : {first.target_distance}  ({first.target_pct}% of entry)")
        print(f"Reward:risk   : {first.rr}")
    print()
    header = f"{'Lot':>6} | {'Risk $':>10} | {'Reward $':>10}"
    print(header)
    print("-" * len(header))
    for r in results:
        reward = f"{r.reward_usd}" if r.reward_usd is not None else "-"
        print(f"{r.lot:>6} | {r.risk_usd:>10} | {reward:>10}")


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Trading risk calculator")
    parser.add_argument("--symbol", default="XAUUSD")
    parser.add_argument("--spread", default="0", help="spread in price units, e.g. 0.20")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_risk = sub.add_parser("risk", help="money at risk / reward for a trade")
    p_risk.add_argument("--entry", required=True)
    p_risk.add_argument("--stop", required=True)
    p_risk.add_argument("--target")
    p_risk.add_argument("--lot", nargs="+", required=True)

    p_ms = sub.add_parser("max-stop", help="widest stop for a lot and dollar risk")
    p_ms.add_argument("--lot", nargs="+", required=True)
    p_ms.add_argument("--risk", nargs="+", required=True)

    p_ml = sub.add_parser("max-lot", help="largest lot for a stop distance and dollar risk")
    p_ml.add_argument("--stop-distance", required=True)
    p_ml.add_argument("--risk", nargs="+", required=True)

    p_ck = sub.add_parser("check", help="validate a trade against risk/limits.json")
    p_ck.add_argument("--entry", required=True)
    p_ck.add_argument("--stop", required=True)
    p_ck.add_argument("--target")
    p_ck.add_argument("--lot", required=True)
    p_ck.add_argument("--losses-today", type=int, default=0)
    p_ck.add_argument("--limits", default=str(LIMITS_PATH))

    args = parser.parse_args(argv)
    try:
        spec = load_spec(args.symbol)
        cs = spec["contract_size"]

        if args.cmd == "risk":
            results = [trade_risk(args.entry, args.stop, lot, target=args.target,
                                  contract_size=cs, spread=args.spread) for lot in args.lot]
            _print_risk(args.symbol, spec, results, args.spread)

        elif args.cmd == "max-stop":
            print(f"{args.symbol.upper()}: widest stop distance (price) that keeps the loss within the risk")
            for lot in args.lot:
                for risk in args.risk:
                    dist = max_stop_distance(lot, risk, cs, spread=args.spread)
                    print(f"  lot {D(lot)} at ${D(risk)} risk -> stop no wider than {dist}")

        elif args.cmd == "max-lot":
            for risk in args.risk:
                lot = max_lot(args.stop_distance, risk, cs, spec.get("min_lot", "0.01"),
                              spec.get("lot_step", "0.01"), spread=args.spread)
                if lot is None:
                    min_lot = D(spec.get("min_lot", "0.01"))
                    at_min = money((D(args.stop_distance) + D(args.spread)) * D(cs) * min_lot)
                    print(f"  ${D(risk)} risk, stop {D(args.stop_distance)}: NO TRADE - even the minimum "
                          f"lot {min_lot} risks ${at_min}. Tighten the entry or skip.")
                else:
                    print(f"  ${D(risk)} risk, stop {D(args.stop_distance)}: max lot {lot}")

        elif args.cmd == "check":
            limits = load_limits(Path(args.limits))
            verdict, findings, result = check_trade(
                args.entry, args.stop, args.lot, limits, target=args.target, contract_size=cs,
                losses_today=args.losses_today, spread=args.spread)
            print(f"{args.symbol.upper()} {result.direction}, lot {D(args.lot)}: {verdict}")
            for level, message in findings:
                print(f"  [{level}] {message}")
            return 1 if verdict == "FAIL" else 0
    except (ValueError, FileNotFoundError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
