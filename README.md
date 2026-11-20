# Personal Trading Agent

A trading analyst you teach day by day, inside Claude chat. You send TradingView screenshots. The agent:
- reads them precisely;
- applies **your** strategy and risk rules without emotion;
- gives a signal or a clear **NO TRADE**;
- learns from every result.

It starts with gold (XAUUSD); oil and Bitcoin come later.

> **Personal use only. Analysis, not financial advice.** You decide and you place every trade. Leveraged gold CFDs can lose money quickly, and no system guarantees profits.

## Daily workflow
1. **Before a trade:** send screenshots (4H, then 15m, 5m and 1m if you use them) and type `/analyze`.
   - The agent first commits to its own **blind call**.
   - Then it gives the plan: entry, stop, targets, lot size, **dollars at risk**, and a rule check.
   - Or it says NO TRADE, and why.
2. **Decide yourself.** Check the levels on your broker's own chart (TradingView prices differ slightly).
3. **After the trade** (or after skipping it): type `/log` with the result and a screenshot. The agent scores its own call and records the lesson.
4. **When you explain a rule:** type `/teach` and say it in your own words. The agent turns it into a precise rule and asks before saving.
5. **Weekend:** type `/review` to see results by setup, session, weekday and emotion, the agent's accuracy, and next week's focus.

## What is in this repository
| Folder | What it holds |
|---|---|
| `CLAUDE.md` | The agent's operating manual (read automatically every session) |
| `.claude/skills/` | The `/analyze`, `/log`, `/teach` and `/review` commands |
| `playbook/` | Your strategy (Parallel Channel) and confluence notes |
| `risk/` | Your limits, rules and psychology checklist |
| `instruments/` | Contract specs and trading hours per market |
| `journal/` | One page per analysed setup or trade, with its screenshot |
| `lessons/` | What the agent has learned, and its scorecard |
| `tools/` | Risk calculator and journal statistics (`python -m pytest` tests them) |
| `docs/roadmap.md` | Later phases: TradingView indicator, automatic alerts, automatic execution |

## Calculator examples (the numbers are only examples)
```bash
python tools/calc.py risk --entry 3571.302 --stop 3551.248 --target 3600.662 --lot 0.01 0.02 0.10
```
```bash
python tools/calc.py max-stop --lot 0.02 0.10 --risk 15 30
```
```bash
python tools/calc.py max-lot --stop-distance 20.054 --risk 15 30
```
```bash
python tools/stats.py journal/
```

## Privacy and safety
- **Keep this repository private.** The journal, results, risk limits and strategy are personal. The agent will not commit them while the repository is public.
- **Never** paste broker passwords, logins, API keys or account numbers into the chat or this repository.
- **Signals are for you only.** Sharing or selling trading signals to other people can count as regulated investment advice in many countries. Check your local law first.
- **Taxes:** trading profits may be taxable where you live. Keep the journal as a record.

## Still to confirm
- [ ] Make this repository private.
- [ ] Verify the gold contract size (100 oz per lot?) in the broker terminal's symbol specification.
- [ ] Confirm what you mean by a "pip" on gold, or keep using dollars only.
- [ ] Set a minimum reward-to-risk, if you want one.
