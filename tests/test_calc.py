from decimal import Decimal

import pytest

import calc

# Levels read from the 20 Nov 2026 TVC:GOLD 5m chart (public market prices).
ENTRY, STOP, TARGET = "3571.302", "3551.248", "3600.662"


@pytest.mark.parametrize("lot, expected", [("0.05", "100.27"), ("0.03", "60.16"), ("0.01", "20.05")])
def test_risk_dollars_for_wide_stop(lot, expected):
    r = calc.trade_risk(ENTRY, STOP, lot, target=TARGET, contract_size=100)
    assert r.direction == "long"
    assert r.stop_distance == Decimal("20.054")
    assert r.risk_usd == Decimal(expected)


def test_reward_and_rr():
    r = calc.trade_risk(ENTRY, STOP, "0.05", target=TARGET, contract_size=100)
    assert r.target_distance == Decimal("29.360")
    assert r.reward_usd == Decimal("146.80")
    assert r.rr == Decimal("1.46")
    assert r.stop_pct == Decimal("0.562")
    assert r.target_pct == Decimal("0.822")


def test_earlier_long_rr():
    r = calc.trade_risk("3516.739", "3508.928", "0.01", target="3550.826", contract_size=100)
    assert r.rr == Decimal("4.36")


def test_short_direction_and_validation():
    r = calc.trade_risk("3586", "3590", "0.05", target="3544", contract_size=100)
    assert r.direction == "short"
    assert r.risk_usd == Decimal("20.00")
    with pytest.raises(ValueError):
        calc.trade_risk("3586", "3590", "0.05", target="3600", contract_size=100)
    with pytest.raises(ValueError):
        calc.trade_risk("3586", "3586", "0.05")


def test_spread_widens_risk_and_shrinks_reward():
    r = calc.trade_risk("3000", "2998", "0.05", target="3004", contract_size=100, spread="0.20")
    assert r.risk_usd == Decimal("11.00")    # (2.00 + 0.20) x 100 x 0.05
    assert r.reward_usd == Decimal("19.00")  # (4.00 - 0.20) x 100 x 0.05


@pytest.mark.parametrize("lot, risk, expected", [
    ("0.05", "10", "2.00"), ("0.05", "20", "4.00"),
    ("0.03", "10", "3.33"), ("0.03", "20", "6.66"),
    ("0.01", "10", "10.00"), ("0.01", "20", "20.00"),
])
def test_max_stop_rounds_down(lot, risk, expected):
    assert calc.max_stop_distance(lot, risk, 100) == Decimal(expected)


def test_max_stop_never_exceeds_risk():
    dist = calc.max_stop_distance("0.03", "20", 100)
    assert calc.trade_risk("3000", Decimal("3000") - dist, "0.03", contract_size=100).risk_usd <= Decimal("20")


@pytest.mark.parametrize("risk", ["10", "20"])
def test_max_lot_wide_stop_is_no_trade(risk):
    # A 20.054 stop risks $20.05 even at the 0.01 minimum lot, above either cap.
    assert calc.max_lot("20.054", risk, 100) is None


def test_max_lot_rounds_down():
    assert calc.max_lot("2.00", "10", 100) == Decimal("0.05")
    assert calc.max_lot("3.00", "10", 100) == Decimal("0.03")  # 0.0333 -> 0.03
    assert calc.max_lot("2.10", "10", 100) == Decimal("0.04")  # 0.0476 -> 0.04


# Example limits for testing only (not anyone's real settings).
LIMITS = {
    "allowed_lots": [0.02, 0.05],
    "exception_lots": [0.01],
    "normal_risk_usd": 12,
    "max_risk_usd": 25,
    "daily_loss_count_limit": 2,
    "min_rr": None,
}


def test_check_pass():
    verdict, findings, _ = calc.check_trade("3000", "2998", "0.05", LIMITS, target="3004", contract_size=100)
    assert verdict == "PASS", findings


def test_check_warn_above_normal_risk():
    verdict, _, result = calc.check_trade("3000", "2997", "0.05", LIMITS, target="3006", contract_size=100)
    assert result.risk_usd == Decimal("15.00")  # above 12 normal, below 25 cap
    assert verdict == "WARN"


def test_check_fail_wide_stop():
    verdict, findings, _ = calc.check_trade(ENTRY, STOP, "0.05", LIMITS, target=TARGET, contract_size=100)
    assert verdict == "FAIL"
    assert any("hard cap" in m for level, m in findings if level == "FAIL")


def test_check_fail_at_daily_loss_limit():
    verdict, findings, _ = calc.check_trade("3000", "2998", "0.05", LIMITS, target="3004",
                                            contract_size=100, losses_today=2)
    assert verdict == "FAIL"
    assert any("stop after 2" in m for _, m in findings)


def test_check_fail_unknown_lot():
    verdict, _, _ = calc.check_trade("3000", "2999", "0.10", LIMITS, target="3002", contract_size=100)
    assert verdict == "FAIL"


def test_check_min_rr():
    limits = dict(LIMITS, min_rr=1.5)
    verdict, _, _ = calc.check_trade("3000", "2998", "0.05", limits, target="3002", contract_size=100)
    assert verdict == "FAIL"


def test_unset_contract_size_refuses(tmp_path):
    specs = tmp_path / "specs.json"
    specs.write_text('{"USOIL": {"contract_size": null}}')
    with pytest.raises(ValueError, match="not set"):
        calc.load_spec("USOIL", specs)


def test_cli_max_lot_no_trade(capsys):
    assert calc.main(["max-lot", "--stop-distance", "20.054", "--risk", "10"]) == 0
    out = capsys.readouterr().out
    assert "NO TRADE" in out and "$20.05" in out


def test_cli_risk_table(capsys):
    assert calc.main(["risk", "--entry", ENTRY, "--stop", STOP, "--target", TARGET, "--lot", "0.05"]) == 0
    out = capsys.readouterr().out
    assert "100.27" in out and "146.80" in out and "1.46" in out
