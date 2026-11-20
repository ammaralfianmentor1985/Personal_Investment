# USOIL (WTI crude oil CFD)

Not set up yet. Before the first oil trade:
1. Read the contract size, minimum lot and trading hours from the broker's symbol specification. Add them to `instruments/specs.json`. **The calculator refuses oil until the contract size is set.**
2. Note the inventory releases: API on Tuesday at 16:30 and EIA on Wednesday at 10:30 (New York time), plus OPEC+ meeting dates.
3. Teach the agent (`/teach`) how the Parallel Channel strategy changes for oil, if it does.
