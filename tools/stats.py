#!/usr/bin/env python3
"""Journal statistics for the trading agent.

Reads the YAML-style header at the top of every journal entry (between two
'---' lines, flat 'key: value' pairs only) and reports results.

  python tools/stats.py journal/
  python tools/stats.py journal/ --loss-limit 3

Files whose name starts with '_' (templates) are skipped.
A trade counts as closed when outcome is win, loss or breakeven.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from datetime import date
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIMITS_PATH = ROOT / "risk" / "limits.json"
CLOSED = {"win", "loss", "breakeven"}
CENT = Decimal("0.01")
NUMBER = re.compile(r"-?\d+(\.\d+)?")


def parse_scalar(raw: str):
    value = raw.strip()
    if value[:1] in {"'", '"'}:
        closing = value.find(value[0], 1)
        if closing != -1:
            return value[1:closing]  # quoted string; anything after it is a comment
    if " #" in value:
        value = value.split(" #", 1)[0].strip()
    if value == "" or value.lower() in {"null", "~", "none"}:
        return None
    lowered = value.lower()
    if lowered == "true":
        return True
    if lowered == "false":
        return False
    if NUMBER.fullmatch(value):
        return Decimal(value)
    return value


def parse_front_matter(text: str) -> dict | None:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return None
    data: dict = {}
    for line in lines[1:]:
        if line.strip() == "---":
            return data
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            continue
        key, _, value = line.partition(":")
        data[key.strip()] = parse_scalar(value)
    return None  # header never closed


def load_entries(folder) -> list[dict]:
    entries = []
    for path in sorted(Path(folder).rglob("*.md")):
        if path.name.startswith("_"):
            continue
        header = parse_front_matter(path.read_text(encoding="utf-8"))
        if header is None:
            continue
        header["_file"] = str(path)
        entries.append(header)
    return entries


def result_r(entry: dict) -> Decimal | None:
    """R multiple: recorded value, else computed from entry/stop/exit."""
    if isinstance(entry.get("result_r"), Decimal):
        return entry["result_r"]
    needed = [entry.get(k) for k in ("entry", "stop", "exit")]
    if not all(isinstance(v, Decimal) for v in needed):
        return None
    e, s, x = needed
    risk = abs(e - s)
    if risk == 0:
        return None
    move = (x - e) if s < e else (e - x)
    return (move / risk).quantize(CENT, rounding=ROUND_HALF_UP)


def _pct(part: int, whole: int) -> Decimal | None:
    if whole == 0:
        return None
    return (Decimal(part) * 100 / Decimal(whole)).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)


def _group_stats(trades: list[dict]) -> dict:
    wins = sum(1 for t in trades if t.get("outcome") == "win")
    rs = [r for r in (result_r(t) for t in trades) if r is not None]
    avg_r = (sum(rs) / len(rs)).quantize(CENT, rounding=ROUND_HALF_UP) if rs else None
    return {"trades": len(trades), "wins": wins, "win_rate_pct": _pct(wins, len(trades)), "avg_r": avg_r}


def weekday(entry: dict) -> str:
    try:
        return date.fromisoformat(str(entry.get("date"))).strftime("%A")
    except ValueError:
        return "unknown"


def daily_rule_violations(closed: list[dict], loss_limit: int) -> list[str]:
    """Trades opened after the daily loss limit had already been reached."""
    by_day = defaultdict(list)
    for t in closed:
        by_day[str(t.get("date"))].append(t)
    problems = []
    for day, trades in sorted(by_day.items()):
        trades.sort(key=lambda t: str(t.get("time") or ""))
        losses = 0
        for t in trades:
            if losses >= loss_limit:
                problems.append(f"{day}: trade at {t.get('time') or '?'} taken after {losses} losses "
                                f"({Path(t['_file']).name})")
            if t.get("outcome") == "loss":
                losses += 1
    return problems


def summarize(entries: list[dict], loss_limit: int = 3) -> dict:
    closed = [e for e in entries if e.get("outcome") in CLOSED]
    rs = [r for r in (result_r(t) for t in closed) if r is not None]
    pnl = [t["pnl_usd"] for t in closed if isinstance(t.get("pnl_usd"), Decimal)]
    judged = [e for e in entries if isinstance(e.get("agent_correct"), bool)]

    def by(key_fn):
        groups = defaultdict(list)
        for t in closed:
            groups[key_fn(t)].append(t)
        return {k: _group_stats(v) for k, v in sorted(groups.items())}

    overall = _group_stats(closed)
    return {
        "entries": len(entries),
        "closed": len(closed),
        "open_or_unknown": sum(1 for e in entries if e.get("outcome") not in CLOSED | {"skipped"}),
        "skipped": sum(1 for e in entries if e.get("outcome") == "skipped"),
        "wins": overall["wins"],
        "losses": sum(1 for t in closed if t.get("outcome") == "loss"),
        "breakeven": sum(1 for t in closed if t.get("outcome") == "breakeven"),
        "win_rate_pct": overall["win_rate_pct"],
        "avg_r": overall["avg_r"],
        "total_r": sum(rs) if rs else Decimal("0"),
        "net_pnl_usd": sum(pnl) if pnl else Decimal("0"),
        "agent_calls_judged": len(judged),
        "agent_correct": sum(1 for e in judged if e["agent_correct"]),
        "agent_accuracy_pct": _pct(sum(1 for e in judged if e["agent_correct"]), len(judged)),
        "by_setup": by(lambda t: str(t.get("setup") or "unknown")),
        "by_session": by(lambda t: str(t.get("session") or "unknown")),
        "by_weekday": by(weekday),
        "loss_limit": loss_limit,
        "daily_rule_violations": daily_rule_violations(closed, loss_limit),
    }


def _fmt(value, suffix="") -> str:
    return "n/a" if value is None else f"{value}{suffix}"


def format_summary(s: dict) -> str:
    lines = [
        f"Journal entries : {s['entries']}  (closed {s['closed']}, skipped {s['skipped']}, "
        f"open/unknown {s['open_or_unknown']})",
        f"Results         : {s['wins']} wins, {s['losses']} losses, {s['breakeven']} breakeven",
        f"Win rate        : {_fmt(s['win_rate_pct'], '%')}",
        f"Average R       : {_fmt(s['avg_r'])}   (this is the expectancy per trade in R)",
        f"Total R         : {s['total_r']}",
        f"Net P&L         : ${s['net_pnl_usd']}",
        f"Agent accuracy  : {_fmt(s['agent_accuracy_pct'], '%')} "
        f"({s['agent_correct']}/{s['agent_calls_judged']} blind calls judged)",
    ]
    for title, key in (("By setup", "by_setup"), ("By session", "by_session"), ("By weekday", "by_weekday")):
        if s[key]:
            lines.append(f"\n{title}:")
            for name, g in s[key].items():
                lines.append(f"  {name:<28} trades {g['trades']:>3}  win {_fmt(g['win_rate_pct'], '%'):>7}  "
                             f"avg R {_fmt(g['avg_r'])}")
    lines.append(f"\nDaily rule (stop after {s['loss_limit']} losses):")
    if s["daily_rule_violations"]:
        lines.extend(f"  BROKEN - {v}" for v in s["daily_rule_violations"])
    else:
        lines.append("  kept on every day recorded")
    return "\n".join(lines)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Trading journal statistics")
    parser.add_argument("folder", nargs="?", default=str(ROOT / "journal"))
    parser.add_argument("--loss-limit", type=int, help="daily loss count limit (default: from risk/limits.json, else 3)")
    parser.add_argument("--json", action="store_true", help="print raw numbers as JSON")
    args = parser.parse_args(argv)

    loss_limit = args.loss_limit
    if loss_limit is None:
        try:
            loss_limit = int(json.loads(LIMITS_PATH.read_text()).get("daily_loss_count_limit", 3))
        except (FileNotFoundError, ValueError):
            loss_limit = 3

    summary = summarize(load_entries(args.folder), loss_limit=loss_limit)
    if args.json:
        print(json.dumps(summary, default=str, indent=2))
    else:
        print(format_summary(summary))
    return 0


if __name__ == "__main__":
    sys.exit(main())
