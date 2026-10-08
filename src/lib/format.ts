import type { Currency } from './types'
export const idr = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID')
export const money = (n: number, c: Currency) => c === 'IDR' ? idr(n) : '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 })
export const pct = (n: number) => (n >= 0 ? '+' : '') + (n * 100).toFixed(1) + '%'
export const qtyFmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 8 })
