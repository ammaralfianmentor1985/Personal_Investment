---
name: analyze
description: Analyse a TradingView screenshot (or several timeframes) with the user's playbook and risk rules, give a blind call, then a signal or NO TRADE, and journal it. Use whenever the user sends a chart screenshot or says /analyze.
---

# /analyze: chart screenshot to signal or NO TRADE

## Before you start
1. Read `risk/limits.json`, `risk/rules.md`, `playbook/parallel-channel.md`, `lessons/lessons.md` and `instruments/<symbol>.md`. If any is missing, say so. Do not size a trade without the limits.
2. Ask how many losses the user has taken today, unless they already said. If it is at or above the daily limit, the reply is "learning analysis only".
3. If only one timeframe was sent, analyse it, but mark the higher-timeframe bias "unknown". Ask for the 4H (and 15m when the chart is 5m or 1m) next time.

## Steps
Follow the protocol in `CLAUDE.md` (steps 0 to 10) exactly. In particular:
- Make your **blind call** before you read any explanation the user gave of their own trade.
- Mark every number **exact** (read from a label) or **≈** (estimated, with ±).
- Run the calculator. Never do money maths in your head:
  ```
  python tools/calc.py check --entry E --stop S --target T --lot L --losses-today N
  python tools/calc.py max-lot --stop-distance D --risk <normal> <hard cap>
  ```
- If the structural stop does not fit even the minimum lot within the hard cap, say **NO TRADE**. Describe what a valid tighter entry would need to look like on a lower timeframe.

## Reply template
```
**Blind call:** LONG | SHORT | WAIT | NO TRADE: <one line why>

**Chart:** <symbol> · <feed> · <tf> · <day date time tz> · <session>
**Price:** <exact> (<day change>)

**What I see** (exact = from labels, ≈ = estimated ±x)
- Structure: ...
- Channel: edges ≈..., midline ≈..., price in <lower/middle/upper> third
- Confluences: Fib ..., EMA ..., liquidity ..., S/R ..., session/news ...

**Setup:** <playbook setup name and status> | checklist <n>/<m> (failed: ...)

**Plan** (or "NO TRADE because ...")
| | Price | Distance | Notes |
|---|---|---|---|
| Entry | | | |
| Stop | | | structural reason |
| Target 1 | | | |
| Target 2 | | | |

**Size and risk** (from tools/calc.py)
| Lot | Risk $ | Reward $ (T1) | R:R |
|---|---|---|---|

**Rule check:** PASS | WARN | FAIL, with the findings
**Invalidation:** what would prove this wrong
**Before you click:** check the level on your broker's chart (feed offset), the spread, and news in the next 30 min.

*Analysis only, not financial advice. You decide and you execute.*
```

## After replying
1. Create the journal entry from `journal/_TEMPLATE.md` with status `analysed` and outcome `unknown`. Fill in the blind call and every level.
2. Copy the screenshot file (its path appears in the conversation) to `journal/<YYYY>/images/<entry-id>.png`. If no file path is available, write "screenshot not saved" in the entry.
3. If the user also explained their own reasoning, write it under "User's reasoning" in their words.
4. Ask the user to send the outcome later with `/log`.
5. Commit only if the repository is private (see the Privacy section in `CLAUDE.md`).
