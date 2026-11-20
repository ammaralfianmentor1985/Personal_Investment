---
name: review
description: Weekly (or on-demand) review of the trading journal - statistics by setup, session, weekday and emotion, agent accuracy, rule breaks, and which lessons to promote or retire. Use when the user says /review or asks how they or the agent are doing.
---

# /review: weekly performance and learning review

1. **Run the numbers. Do not compute them by hand.**
   ```
   python tools/stats.py journal/
   ```
   If the user asks for a time range, say "this week", filter to those dates and say which dates were included.
2. **Read every journal entry in the period,** including skipped trades and NO TRADE calls.
3. **Report in this order** (short, with tables):
   1. **Results:** trades, win rate, average R (expectancy), total R, net $.
   2. **Discipline:**
      - daily-limit breaks;
      - trades above the normal dollar risk;
      - lots outside the allowed sizes;
      - entries where `rules_followed` is false.
   3. **What works:** the best and worst setup, session and weekday. **Say when a sample is too small**; under 10 trades is anecdote, not evidence.
   4. **Psychology:** results grouped by emotion tag, for example "FOMO trades: 3, all losses".
   5. **Agent accuracy:** the blind-call accuracy this period and overall, plus where the agent was wrong and why.
4. **Lessons.** Using the lifecycle in `CLAUDE.md`, propose which lessons to promote (hypothesis to candidate to confirmed) or retire, citing the journal entries. Apply the changes to `lessons/lessons.md` only after the user agrees.
5. **One focus for next week.** Give a single, specific behaviour to practise.
6. **Roadmap gate check.** Compare the total journaled setups and the stability of the rules with the gates in `docs/roadmap.md`. Say whether the next phase is unlocked, without pushing for it.

Commit only if the repository is private (see the Privacy section in `CLAUDE.md`).
