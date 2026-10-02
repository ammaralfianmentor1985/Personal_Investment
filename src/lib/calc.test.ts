import { describe, it, expect } from 'vitest'
import { position } from './calc'
import type { Holding } from './types'

const h = (lots: Holding['lots']): Holding => ({ id: '1', kind: 'stock', symbol: 'BMRI.JK', name: 'x', currency: 'IDR', lots })
describe('position', () => {
  it('averages buys', () => {
    const p = position(h([{ id: 'a', date: '2024-01-01', side: 'buy', qty: 100, price: 10 }, { id: 'b', date: '2024-02-01', side: 'buy', qty: 100, price: 20 }]))
    expect(p).toEqual({ qty: 200, cost: 3000, avg: 15 })
  })
  it('sell keeps average cost', () => {
    const p = position(h([{ id: 'a', date: '2024-01-01', side: 'buy', qty: 100, price: 10 }, { id: 'b', date: '2024-02-01', side: 'sell', qty: 50, price: 30 }]))
    expect(p).toEqual({ qty: 50, cost: 500, avg: 10 })
  })
})
