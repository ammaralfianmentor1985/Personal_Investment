# Confluence: indicators

The user's exact indicator settings, and how their strategy uses them, are recorded in `parallel-channel.md`. This file explains the general behaviour.

## Exponential moving averages (EMAs)
- **Trend filter:** price above a rising slow EMA favours longs; below a falling slow EMA favours shorts.
- **Dynamic support and resistance:** in a trend, pullbacks often stall at the fast EMA.
- **Crossovers lag.** By the time a fast EMA crosses a slow EMA, much of the move has often happened. Treat a cross as context, not a trigger.
- **Slope matters.** A flat EMA means a range, and EMA signals are weak in ranges.

## Fibonacci retracement and extension
- Draw from swing low to swing high for an up move, and the reverse for a down move. **Always state which swing the levels come from.**
- Common retracement levels are 0.382, 0.5, 0.618 and 0.786. Common extension levels are 1.272 and 1.618.
- After a large drop, a retracement *up* to 0.382–0.618 that rejects there is a classic place for the downtrend to resume. A clean break and hold above 0.618 weakens the bearish case.
- Fibonacci levels matter most when they line up with something else, such as a channel edge, an EMA or a round number.

## Volatility (ATR)
- The Average True Range (ATR, 14 periods) on the entry timeframe shows the typical candle range.
- Guideline (not a law): a stop smaller than about half an ATR is likely to be hit by normal noise. The agent flags it so the user can decide.
- Volatility jumps around news and session opens. The same stop distance carries more risk then.

## Volume on TradingView gold
TVC:GOLD and broker CFD volume is **tick volume**, not exchange volume. Use it lightly, only for relative spikes.
