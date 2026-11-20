from decimal import Decimal

import stats


def write(folder, name, header: str, body: str = "Notes.\n"):
    path = folder / name
    path.write_text(f"---\n{header.strip()}\n---\n\n{body}", encoding="utf-8")
    return path


def test_parse_front_matter_types():
    text = "---\ndate: 2026-11-20\ntime: 05:08\nentry: 3571.302\nagent_correct: true\nlot: null\n" \
           "setup: B-ema20-pullback  # hypothesis\nnote: \"a # b\"\nstart: \"00:30\"   # estimated\n" \
           "risk_usd: null   # 0.01 = $7.81\n---\nbody"
    h = stats.parse_front_matter(text)
    assert h["date"] == "2026-11-20"
    assert h["time"] == "05:08"
    assert h["start"] == "00:30"
    assert h["risk_usd"] is None
    assert h["entry"] == Decimal("3571.302")
    assert h["agent_correct"] is True
    assert h["lot"] is None
    assert h["setup"] == "B-ema20-pullback"
    assert h["note"] == "a # b"


def test_result_r_computed_from_exit():
    assert stats.result_r({"entry": Decimal("3000"), "stop": Decimal("2998"), "exit": Decimal("3004")}) == Decimal("2.00")
    assert stats.result_r({"entry": Decimal("3000"), "stop": Decimal("3002"), "exit": Decimal("3003")}) == Decimal("-1.50")
    assert stats.result_r({"result_r": Decimal("1.2")}) == Decimal("1.2")
    assert stats.result_r({"entry": Decimal("3000")}) is None


def test_summary_and_daily_rule(tmp_path):
    day = "date: 2026-11-16\nsession: london\nsetup: A-lower-edge\n"
    write(tmp_path, "t1.md", day + "time: 08:00\noutcome: loss\nresult_r: -1\npnl_usd: -10\nagent_correct: false")
    write(tmp_path, "t2.md", day + "time: 09:00\noutcome: loss\nresult_r: -1\npnl_usd: -10\nagent_correct: true")
    write(tmp_path, "t3.md", day + "time: 10:00\noutcome: loss\nresult_r: -1\npnl_usd: -10")
    write(tmp_path, "t4.md", day + "time: 11:00\noutcome: win\nentry: 3000\nstop: 2998\nexit: 3006\npnl_usd: 15")
    write(tmp_path, "t5.md", "date: 2026-11-17\ntime: 08:00\nsession: new-york\nsetup: C-channel-top-short\n"
                             "outcome: win\nresult_r: 2\npnl_usd: 20\nagent_correct: true")
    write(tmp_path, "t6.md", "date: 2026-11-18\noutcome: skipped\nagent_correct: true")
    write(tmp_path, "t7.md", "date: 2026-11-18\noutcome: unknown")
    write(tmp_path, "_TEMPLATE.md", "date: 2026-01-01\noutcome: win\nresult_r: 99")
    (tmp_path / "notes.md").write_text("no header here")

    s = stats.summarize(stats.load_entries(tmp_path), loss_limit=3)
    assert s["entries"] == 7
    assert s["closed"] == 5
    assert s["skipped"] == 1
    assert s["open_or_unknown"] == 1
    assert (s["wins"], s["losses"]) == (2, 3)
    assert s["win_rate_pct"] == Decimal("40.0")
    assert s["total_r"] == Decimal("2.00")          # -1 -1 -1 +3 +2
    assert s["avg_r"] == Decimal("0.40")
    assert s["net_pnl_usd"] == Decimal("5")
    assert s["agent_accuracy_pct"] == Decimal("75.0")  # 3 of 4 judged
    assert len(s["daily_rule_violations"]) == 1
    assert "11:00" in s["daily_rule_violations"][0]
    assert s["by_weekday"]["Monday"]["trades"] == 4
    assert s["by_setup"]["C-channel-top-short"]["win_rate_pct"] == Decimal("100.0")
    text = stats.format_summary(s)
    assert "BROKEN" in text and "Win rate        : 40.0%" in text


def test_empty_journal_has_no_division_errors(tmp_path):
    s = stats.summarize(stats.load_entries(tmp_path))
    assert s["win_rate_pct"] is None and s["avg_r"] is None and s["agent_accuracy_pct"] is None
    assert "n/a" in stats.format_summary(s)
