import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { State } from '../lib/types'
import { totals } from '../lib/calc'

const KEY = 'ledger.v1'
export const initial: State = {
  v: 1, holdings: [], cash: [], expenses: [],
  budgets: { Food: 3000000, Transport: 1000000 },
  fx: { usdIdr: 16000, manual: false, asOf: 0 },
  targets: { stock: 50, crypto: 10, gold: 15, cash: 25 },
  quotes: {}, snapshots: [],
}

function load(): State {
  try { const r = localStorage.getItem(KEY); if (r) return { ...initial, ...JSON.parse(r) } } catch { /* ignore */ }
  return initial
}

type Ctx = { s: State; set: (f: (s: State) => State) => void; replace: (s: State) => void }
const C = createContext<Ctx>(null!)
export const useStore = () => useContext(C)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(load)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ } }, [s])
  // daily net-worth snapshot for the trend line
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10), net = Math.round(totals(s).net)
    if (net <= 0) return
    const last = s.snapshots[s.snapshots.length - 1]
    if (last?.date === today && last.value === net) return
    setS(p => ({ ...p, snapshots: [...p.snapshots.filter(x => x.date !== today), { date: today, value: net }].slice(-365) }))
  }, [s])
  return <C.Provider value={{ s, set: f => setS(f), replace: setS }}>{children}</C.Provider>
}
