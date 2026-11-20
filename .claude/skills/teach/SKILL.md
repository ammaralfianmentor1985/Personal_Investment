---
name: teach
description: The user explains a trading rule, setup, habit or market idea in their own words; turn it into a precise, testable playbook rule, confirm it with them, and save it. Use when the user says /teach or starts explaining how they trade.
---

# /teach: turn the user's explanation into a precise rule

1. **Listen first.** Quote the user's explanation back in one or two sentences, using their own words.
2. **Make it precise.** Rewrite it as a rule a stranger could follow without asking questions:
   - **When:** market conditions, timeframe, session.
   - **Where:** the exact location, for example "a candle wick touches the lower channel line, within ≈$1".
   - **Trigger:** the exact candle or event, for example "a 5m close back inside the channel".
   - **Entry, stop, targets:** each tied to a structure, not to a feeling.
   - **Invalidation:** what cancels it.
   - **Filters:** for example "not within 15 min of high-impact news".
3. **Ask about anything vague.** Ask about "strong", "near", "big drop", "confirmation" and similar words. Ask one round of short questions (up to 4). Offer concrete options, so the user can tap an answer instead of typing.
4. **Check it against existing rules.** Look for conflicts with `playbook/` and `risk/`. Point out any conflict and ask which rule wins.
5. **Show the exact change** as the new or edited section, then wait for the user's "yes".
6. **Save it.** Write it to the right file:
   - setups go in `playbook/parallel-channel.md`;
   - confluence knowledge goes in `playbook/confluence-*.md`;
   - risk goes in `risk/rules.md`, plus `risk/limits.json` if a number changes;
   - psychology goes in `risk/psychology.md`.

   Add a change-log line with the date. New setups start with status **hypothesis**.
7. **Ask for examples.** Ask for one or two past screenshots of the rule working, and one of it failing, so it can be tested.

Commit only if the repository is private (see the Privacy section in `CLAUDE.md`).
