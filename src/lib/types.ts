export type Currency = 'IDR' | 'USD'
export type Kind = 'stock' | 'crypto' | 'gold'
export interface Lot { id: string; date: string; side: 'buy' | 'sell'; qty: number; price: number }
export interface Holding {
  id: string; kind: Kind; symbol: string; name: string; currency: Currency
  lots: Lot[]; manualPrice?: number; manualAt?: number; intrinsic?: number; thesis?: string; dividends?: number
}
export interface CashAccount { id: string; name: string; currency: Currency; balance: number }
export interface Expense { id: string; date: string; amount: number; category: string; note: string }
export interface Quote { price: number; currency: Currency; asOf: number }
export interface State {
  v: 1
  holdings: Holding[]; cash: CashAccount[]; expenses: Expense[]
  budgets: Record<string, number>
  fx: { usdIdr: number; manual: boolean; asOf: number }
  targets: Record<'stock' | 'crypto' | 'gold' | 'cash', number>
  quotes: Record<string, Quote>
  snapshots: { date: string; value: number }[]
}
