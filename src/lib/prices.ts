import type { Holding, Quote, State } from './types'
import { quoteKey } from './calc'

const OZ = 31.1035
async function j(url: string) { const r = await fetch(url); if (!r.ok) throw new Error(String(r.status)); return r.json() }

export async function fetchFx(): Promise<number> {
  const d = await j('https://open.er-api.com/v6/latest/USD')
  return d.rates.IDR
}
/** crypto: symbol is the CoinGecko id (e.g. "bitcoin"). Gold: PAXG (1 token = 1 oz) in USD → IDR per gram. */
export async function fetchCrypto(ids: string[]): Promise<Record<string, number>> {
  if (!ids.length) return {}
  const d = await j(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`)
  const out: Record<string, number> = {}
  for (const id of ids) if (d[id]?.usd) out[id] = d[id].usd
  return out
}
export async function fetchStock(symbol: string): Promise<number> {
  const d = await j(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`)
  const p = d.chart?.result?.[0]?.meta?.regularMarketPrice
  if (typeof p !== 'number') throw new Error('no price')
  return p
}

/** Refresh all quotes; failures are skipped so cached/manual values keep working. */
export async function refreshAll(s: State): Promise<{ quotes: State['quotes']; fx?: number; errors: string[] }> {
  const quotes = { ...s.quotes }, errors: string[] = [], now = Date.now()
  let fx: number | undefined
  try { fx = await fetchFx() } catch { errors.push('FX rate') }
  const usdIdr = fx ?? s.fx.usdIdr
  const crypto = s.holdings.filter(h => h.kind === 'crypto' && h.manualPrice == null)
  const hasGold = s.holdings.some(h => h.kind === 'gold' && h.manualPrice == null)
  try {
    const ids = [...new Set([...crypto.map(h => h.symbol.toLowerCase()), ...(hasGold ? ['pax-gold'] : [])])]
    const p = await fetchCrypto(ids)
    for (const h of crypto) { const v = p[h.symbol.toLowerCase()]; if (v) quotes[quoteKey(h)] = mk(h, v, usdIdr, now) }
    if (p['pax-gold']) for (const h of s.holdings.filter(h => h.kind === 'gold')) quotes[quoteKey(h)] = { price: (p['pax-gold'] / OZ) * usdIdr, currency: 'IDR', asOf: now }
  } catch { errors.push('Crypto/gold prices') }
  await Promise.all(s.holdings.filter(h => h.kind === 'stock' && h.manualPrice == null).map(async h => {
    try { quotes[quoteKey(h)] = { price: await fetchStock(h.symbol), currency: h.currency, asOf: now } }
    catch { errors.push(`${h.symbol} (set a manual price)`) }
  }))
  return { quotes, fx, errors }
}
function mk(h: Holding, usd: number, fx: number, asOf: number): Quote {
  return h.currency === 'USD' ? { price: usd, currency: 'USD', asOf } : { price: usd * fx, currency: 'IDR', asOf }
}
