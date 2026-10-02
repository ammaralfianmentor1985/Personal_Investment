# Ledger — personal wealth tracker

Track stocks (IDX + global), crypto, gold, cash and expenses in one private site.
Data lives only in your browser (localStorage); export/import JSON from Settings.

- Stack: Vite + React + TypeScript, no backend
- Design: 8-pt grid, dark-green neutral base, amber accent reserved for items needing attention
- Prices: CoinGecko (crypto, gold via PAXG), open.er-api (USD→IDR), Yahoo-style quotes for stocks; manual override always wins

```
npm install
npm run dev     # local
npm test        # calc tests
npm run build   # static output in dist/
```
