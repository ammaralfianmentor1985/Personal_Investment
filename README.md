# Ledger — personal wealth tracker

Track stocks (IDX + global), crypto, gold, cash and expenses in one private dashboard.
Published as a Claude Artifact (open the link on any device while signed in).

- Stack: Vite + React + TypeScript, single-file build
- Storage: private per-user document in the artifact database (`data/users/<id>/ledger`), with a local cache
- Prices: entered by hand (edit the price cell in any table); live price APIs are blocked inside artifacts
- Design: 8-pt grid, dark-green neutral base, amber accent reserved for items needing attention

```
npm install
npm test
npm run build && node scripts/make-artifact.mjs artifact/ledger.html   # artifact/ledger.html is what gets published
```
