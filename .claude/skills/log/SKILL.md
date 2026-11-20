---
name: log
description: Record what happened after an analysed setup (taken or skipped, fills, exit, result, feelings), score the agent's blind call, update the scorecard and propose lesson updates. Use when the user says /log or reports a trade result.
---

# /log: record the outcome and learn from it

## 1. Find the entry
Match by date, time and symbol to an existing `journal/` file. If none exists, create one from `journal/_TEMPLATE.md` and note "logged without prior analysis". In that case, `agent_call` stays `none` and is not scored.

## 2. Ask only for what is missing
- Did you take it? If yes: the lot size, and the actual entry and exit **from the broker** (not TradingView).
- How did it end? Target, stop, manual close, or still open. Ask for a screenshot of the result if possible.
- How did you feel before, during and after? Pick from: calm, FOMO, revenge, fear, hesitation, overconfidence, bored, other.
- Did you follow your rules? If not, which one did you break?

## 3. Update the header
Fill in these fields:
- `status`: `closed`, `open` or `skipped`;
- `outcome`: `win`, `loss`, `breakeven` or `skipped`;
- `exit`, `lot`, `risk_usd`, `pnl_usd`, `result_r`;
- `emotion`, `rules_followed` and `agent_correct`.

Compute R and dollars with the tools. Do not do it by hand:
```
python tools/calc.py risk --entry E --stop S --target <exit> --lot L
```
`result_r` = (exit − entry) ÷ (entry − stop) for a long; (entry − exit) ÷ (stop − entry) for a short.

## 4. Score the blind call
Use this rule exactly and never change a past score:
- **LONG or SHORT call:** correct if price reached the call's first target before its stop; incorrect if the stop came first.
- **WAIT or NO TRADE call:** correct if a trade taken at that moment would have hit its stop, or the setup clearly failed; incorrect if the trade cleanly reached its first target.
- If the outcome cannot be judged from the information given, set `agent_correct: null` and say why.

Then update `lessons/scorecard.md` with the running totals and the latest row.

## 5. Write the lesson
Under "Outcome & lesson" in the entry, write:
- what happened;
- what the agent got right and wrong;
- what the user did well;
- one concrete lesson in a single sentence.

## 6. Propose updates; never apply them silently
- To `lessons/lessons.md`: add support or contradiction to existing lessons, or add a new **hypothesis**. You may apply this yourself, because lessons are evidence, not rules.
- To `playbook/` or `risk/`: show the exact proposed change and wait for "yes".
- If this was the user's loss number N today and N has reached the daily limit, say clearly: **"Daily limit reached: no more trades today."**

Commit only if the repository is private (see the Privacy section in `CLAUDE.md`).
