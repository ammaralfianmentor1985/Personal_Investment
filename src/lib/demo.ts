import type { State } from './types'
const d = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10)
export function demo(s: State): State {
  return {
    ...s,
    holdings: [
      { id: 'd1', kind: 'stock', symbol: 'BMRI.JK', name: 'Bank Mandiri', currency: 'IDR', lots: [{ id: 'l1', date: d(200), side: 'buy', qty: 10000, price: 5200 }], manualAt: Date.now(), manualPrice: 4600, intrinsic: 6500, thesis: 'Dominant state bank, strong ROE, cheap vs book.' },
      { id: 'd2', kind: 'stock', symbol: 'BBCA.JK', name: 'Bank Central Asia', currency: 'IDR', lots: [{ id: 'l2', date: d(300), side: 'buy', qty: 5000, price: 8800 }], manualAt: Date.now(), manualPrice: 9200, intrinsic: 8000 },
      { id: 'd3', kind: 'crypto', symbol: 'bitcoin', name: 'Bitcoin', currency: 'USD', lots: [{ id: 'l3', date: d(120), side: 'buy', qty: 0.05, price: 60000 }], manualAt: Date.now(), manualPrice: 68000 },
      { id: 'd4', kind: 'gold', symbol: 'XAU', name: 'Gold bars', currency: 'IDR', lots: [{ id: 'l4', date: d(400), side: 'buy', qty: 50, price: 1100000 }], manualAt: Date.now(), manualPrice: 1500000 },
    ],
    cash: [{ id: 'c1', name: 'BCA Savings', currency: 'IDR', balance: 85000000 }],
    expenses: [{ id: 'e1', date: d(1), amount: 3400000, category: 'Food', note: 'Groceries & dining' }, { id: 'e2', date: d(2), amount: 450000, category: 'Transport', note: 'Fuel' }],
  }
}
