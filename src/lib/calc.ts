import type { Holding, Quote, State, Currency } from './types'

export const STALE_MS = 30 * 24 * 3600 * 1000
export const uid = () => Math.random().toString(36).slice(2, 10)

/** Position from lots using average-cost method. */
export function position(h: Holding) {
  let qty = 0, cost = 0
  const sorted = [...h.lots].sort((a, b) => a.date.localeCompare(b.date))
  for (const l of sorted) {
    if (l.side === 'buy') { qty += l.qty; cost += l.qty * l.price }
    else { const avg = qty > 0 ? cost / qty : 0; qty -= l.qty; cost -= l.qty * avg }
  }
  qty = Math.max(qty, 0); cost = Math.max(cost, 0)
  return { qty, cost, avg: qty > 0 ? cost / qty : 0 }
}

export const toIdr = (amt: number, cur: Currency, fx: number) => (cur === 'USD' ? amt * fx : amt)

export function quoteKey(h: Holding) { return `${h.kind}:${h.symbol.toLowerCase()}` }

export function priceOf(h: Holding, quotes: State['quotes']) {
  if (h.manualPrice != null) return { price: h.manualPrice, asOf: h.manualAt ?? Date.now(), source: 'manual' as const }
  const q: Quote | undefined = quotes[quoteKey(h)]
  return q ? { price: q.price, asOf: q.asOf, source: 'live' as const } : null
}

export function valueOf(h: Holding, s: State) {
  const { qty, cost, avg } = position(h)
  const p = priceOf(h, s.quotes)
  const price = p?.price ?? avg
  const value = qty * price
  const pl = value - cost
  return {
    qty, avg, price, value, cost, pl, plPct: cost > 0 ? pl / cost : 0,
    valueIdr: toIdr(value, h.currency, s.fx.usdIdr),
    costIdr: toIdr(cost, h.currency, s.fx.usdIdr),
    stale: !p || Date.now() - p.asOf > STALE_MS,
    mos: h.intrinsic && h.intrinsic > 0 ? (h.intrinsic - price) / h.intrinsic : null,
  }
}

export function totals(s: State) {
  const by = { stock: 0, crypto: 0, gold: 0, cash: 0 }
  for (const h of s.holdings) by[h.kind] += valueOf(h, s).valueIdr
  for (const c of s.cash) by.cash += toIdr(c.balance, c.currency, s.fx.usdIdr)
  const net = by.stock + by.crypto + by.gold + by.cash
  return { by, net }
}

export const monthOf = (d: string) => d.slice(0, 7)

export function attention(s: State) {
  const out: string[] = []
  for (const h of s.holdings) {
    const v = valueOf(h, s)
    if (v.qty === 0) continue
    if (v.stale) out.push(`${h.symbol.toUpperCase()}: price not set or older than 30 days`)
    if (v.cost > 0 && v.plPct < -0.2) out.push(`${h.symbol.toUpperCase()} is ${(v.plPct * 100).toFixed(0)}% below your cost`)
    if (v.mos != null && v.mos < 0) out.push(`${h.symbol.toUpperCase()} trades above your intrinsic value`)
  }
  const month = monthOf(new Date().toISOString())
  const spent: Record<string, number> = {}
  for (const e of s.expenses) if (monthOf(e.date) === month) spent[e.category] = (spent[e.category] ?? 0) + e.amount
  for (const [cat, lim] of Object.entries(s.budgets)) if (lim > 0 && (spent[cat] ?? 0) > lim) out.push(`Over budget on ${cat} this month`)
  const { by, net } = totals(s)
  if (net > 0) for (const k of Object.keys(by) as (keyof typeof by)[]) {
    const drift = by[k] / net - s.targets[k] / 100
    if (Math.abs(drift) > 0.1) out.push(`${k[0].toUpperCase() + k.slice(1)} allocation is ${(drift * 100).toFixed(0)} pts off target`)
  }
  return out
}
