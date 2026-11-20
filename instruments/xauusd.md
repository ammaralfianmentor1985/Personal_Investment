# XAUUSD (gold)

## Contract (verify in your broker terminal)
| Item | Value | Status |
|---|---|---|
| Contract size | 100 troy oz per 1.00 lot | **Not yet verified.** Third-party sources only. |
| Minimum lot / step | 0.01 / 0.01 | The broker's official account page shows a 0.01 minimum lot |
| Money per $1.00 move | 0.01 lot = $1 · 0.03 = $3 · 0.05 = $5 · 1.00 = $100 | Valid only if the contract size above is right |

**To verify:** in the broker's web terminal, open the XAUUSD symbol's specification and read the contract size. Then set `"verified": true` in `instruments/specs.json`.

## Feeds: TradingView versus the broker
- TVC:GOLD is TradingView's own gold feed. It is **not** the broker's price. The difference changes over time and can be several tenths of a dollar or more.
- With stops of only a few dollars, that difference matters. **Always confirm entry and stop levels on the broker's own chart before placing an order.**
- In `/log`, record actual fills from the broker, never TradingView prices.

## Trading hours and sessions (New York time; times move about 1 hour when daylight saving changes)
- Trades nearly 24 hours a day, from Sunday evening to Friday evening, with a short daily break at about 17:00 New York time at many brokers.
- **Spreads widen** around that daily rollover, at the Sunday open, and during big news. Avoid entries then.

| Session | Approx. New York time |
|---|---|
| Asia (Tokyo) | 19:00–04:00 |
| London | 03:00–12:00 |
| New York | 08:00–17:00 |
| London and New York overlap (most liquid) | 08:00–12:00 |

## Behaviour
- Intraday ranges are often tens of dollars. US data at 08:30 and FOMC days can move gold many dollars in minutes.
- It reacts to round numbers ($10 / $50 / $100 levels).
- See `playbook/confluence-fundamentals.md` for its drivers.
