# Playbook

The playbook is the user's strategy written as precise, testable setups. The agent applies it, tests it, and proposes changes. It **never edits it silently**.

| File | Contents |
|---|---|
| `parallel-channel.md` | **Main strategy (private).** Parallel channel setups, the checklist and the change log. |
| `confluence-ict.md` | Liquidity, sweeps, structure shifts, fair value gaps, order blocks, premium/discount, session timing. |
| `confluence-price-action.md` | Support and resistance, trendlines, channels, candles, patterns, round numbers. |
| `confluence-indicators.md` | Moving averages, Fibonacci, volatility (ATR), and how the agent uses them. |
| `confluence-fundamentals.md` | What moves gold, oil and Bitcoin, and the news calendar. |

## How a setup is written
Every setup uses this shape, so the agent can check it the same way every time:

```
### Setup X: short name
Status: hypothesis | candidate | confirmed | retired   (examples: n for / n against)
Market: which instruments and timeframes
Context: what must already be true (trend, channel, session)
Location: exactly where price must be
Trigger: the exact candle or event that says "go"
Entry: where the order goes
Stop: structural level plus buffer, and why that level proves the idea wrong
Targets: T1, T2, each tied to a structure
Invalidation: what cancels the setup before entry
Filters: no-trade conditions specific to this setup
Checklist: numbered yes/no items (the agent scores n/m)
Examples: links to journal entries
```

## Status meanings
- **hypothesis:** seen once or twice, or proposed by the agent from a screenshot. Not yet trusted.
- **candidate:** 3 or more supporting examples and at most 1 against.
- **confirmed:** 5 or more supporting, positive average R, and the user agrees.
- **retired:** contradicted by later evidence. Kept for history.
