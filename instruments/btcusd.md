# BTCUSD (Bitcoin CFD)

Not set up yet. Before the first Bitcoin trade:
1. Read the contract size, minimum lot and trading hours from the broker's symbol specification. Add them to `instruments/specs.json`. **The calculator refuses Bitcoin until the contract size is set.**
2. Bitcoin trades 24/7. Weekend liquidity is thinner, and spreads and spikes can be larger.
3. Teach the agent (`/teach`) how the Parallel Channel strategy changes for Bitcoin, if it does.
