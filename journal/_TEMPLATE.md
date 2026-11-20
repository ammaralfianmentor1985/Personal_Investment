---
id: YYYY-MM-DD-xauusd-5m-01
date: YYYY-MM-DD
time: "HH:MM"
timezone: UTC-5
symbol: XAUUSD
feed: TVC:GOLD
timeframe: 5m
session: london          # asia | london | new-york | overlap
setup: none              # playbook setup id, or none
setup_status: none       # hypothesis | candidate | confirmed | none
direction: none          # long | short | none
entry: null
stop: null
target: null
target2: null
lot: null
risk_usd: null
agent_call: none         # long | short | wait | no-trade | none
agent_checklist: null    # e.g. 5/7
user_action: unknown     # took | skipped | unknown
status: analysed         # analysed | open | closed | skipped
outcome: unknown         # win | loss | breakeven | skipped | unknown
exit: null
result_r: null
pnl_usd: null
emotion: null            # calm | fomo | revenge | fear | hesitation | overconfidence | bored | other
rules_followed: null     # true | false
agent_correct: null      # true | false | null (see /log scoring rule)
---

# <Symbol> <tf>: <date> <time>

![chart](images/<id>.png)

## Agent's reading (blind call made first)
- **Blind call:**
- **Exact (from labels):**
- **≈ Estimated:**
- **Setup match / checklist:**
- **Plan and rule check:**

## User's reasoning
_(the user's own words)_

## Outcome & lesson
- **What happened:**
- **Agent right/wrong:**
- **User did well:**
- **Lesson (one sentence):**
