# Lessons

- `lessons.md` (private): every pattern the agent has learned, with its evidence.
- `scorecard.md` (private): how the agent's blind calls have performed over time.

## Lesson format
```
### L-NNN: one-sentence lesson
Status: hypothesis | candidate | confirmed | retired
Evidence: n for / n against  (journal entries: ...)
Applies to: setup / symbol / session
Added: YYYY-MM-DD · Last changed: YYYY-MM-DD (why)
```

The lifecycle is defined in `CLAUDE.md`. The agent may add evidence to lessons on its own. Changing the **playbook** or **risk rules** always needs the user's "yes".
