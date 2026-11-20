# Roadmap

Each phase unlocks only when its gate is met **and** the user says go. The agent checks the gates in `/review`, but never pushes for the next phase.

## Phase 1: Teach and journal in Claude chat (now)
- Screenshots go to `/analyze`; the agent gives a blind call, then a signal or NO TRADE, and journals it.
- Results go to `/log`, which scores the agent and updates the lessons.
- Rules are taught with `/teach`; weekly reviews use `/review`.
- **Limits:** the agent only works when the user opens a chat. It cannot watch the market, send alerts or trade.

## Phase 2: TradingView indicator (Pine Script, works on the free plan)
- An indicator that plots the user's EMAs, draws the parallel channel automatically from swing points, marks touches of the edges and midline, and labels setups by checklist score.
- Gives the user consistent drawings on the chart, and gives the agent cleaner screenshots with exact labels instead of estimates.
- **Gate:** about 20–30 journaled examples, and channel rules precise enough to write as code (how swings are chosen, how an edge "touch" is measured).

## Phase 3: Automatic signals
- An always-on service checks the rules on live prices and messages the user (for example on Telegram) with the signal, the size and a chart.
- **Needs:**
  - a small cloud server;
  - a market data feed;
  - a pay-per-use Claude API key;
  - a Telegram bot.

  TradingView webhooks would also work, but need a paid TradingView plan.
- **Gate:** about 50 or more journaled setups, stable playbook rules (no major rule changes for 4 weeks), and agent blind-call accuracy that is clearly useful.

## Phase 4: Automatic execution
- **Route:** the broker supports automated trading (Expert Advisors) on **MetaTrader 4 and MetaTrader 5**. The usual path is an MT5 account, a Windows server running 24/7 (usually a rented one), and the MetaTrader 5 Python package or an Expert Advisor. A broker REST API may exist in some regions only; verify it with the broker before planning around it.
- **Demo account first,** for at least several weeks of live-market forward testing.
- **Hard kill switches, built in code:**
  - the maximum lot;
  - the dollar cap per trade;
  - the daily loss-count stop;
  - a maximum number of open trades;
  - no trading in news windows;
  - an instant "stop everything" command.
- **Gate:** 100 or more journaled setups, positive expectancy in forward testing, a clean demo period, and the user's explicit go-ahead.

## Risks that stay true in every phase
- Leveraged CFDs can lose money quickly. No system removes that.
- Past results, including backtests and journal statistics, do not guarantee future results.
- Personal use only. Running signals or bots for other people can need a licence.
