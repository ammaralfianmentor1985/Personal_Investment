import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { State } from '../lib/types'
import { totals } from '../lib/calc'

const KEY = 'ledger.v1'
export type Sync = 'loading' | 'local' | 'saved' | 'saving' | 'error'

export const initial: State = {
  v: 1, holdings: [], cash: [], expenses: [],
  budgets: { Food: 3000000, Transport: 1000000 },
  fx: { usdIdr: 16000, manual: true, asOf: 0 },
  targets: { stock: 50, crypto: 10, gold: 15, cash: 25 },
  quotes: {}, snapshots: [],
}

function load(): State {
  try { const r = localStorage.getItem(KEY); if (r) return { ...initial, ...JSON.parse(r) } } catch { /* ignore */ }
  return initial
}

type Ctx = { s: State; set: (f: (s: State) => State) => void; replace: (s: State) => void; sync: Sync }
const C = createContext<Ctx>(null!)
export const useStore = () => useContext(C)

/** Minimal shape of the artifact `db` document we use. */
type Doc = { get(): Promise<{ exists: boolean; data(): unknown }>; set(d: Record<string, unknown>): Promise<void> }

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(load)
  const [sync, setSync] = useState<Sync>('loading')
  const [ready, setReady] = useState(false)
  const doc = useRef<Doc | null>(null)
  const lastSaved = useRef('')
  const latest = useRef(s); latest.current = s
  const queue = useRef<Promise<void>>(Promise.resolve())
  const timer = useRef<number>()

  // fast local cache (per device)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ } }, [s])

  // private per-user document in the artifact database: follows you across devices
  useEffect(() => {
    let dead = false
    ;(async () => {
      try {
        const c = (window as unknown as { claude?: { use?: (n: string) => Promise<any> } }).claude
        const [db, user] = await Promise.all([c?.use?.('db'), c?.use?.('user')])
        const id = await user?.id?.()
        if (dead) return
        if (!db || !id) { setSync('local'); return }
        const d: Doc = db.doc(`data/users/${id}/ledger`)
        const snap = await d.get()
        if (dead) return
        if (snap.exists) {
          const data = JSON.stringify(snap.data())
          lastSaved.current = data
          setS({ ...initial, ...JSON.parse(data) })
        }
        doc.current = d; setReady(true); setSync('saved')
      } catch { if (!dead) setSync('local') }
    })()
    return () => { dead = true }
  }, [])

  // debounced, one-write-at-a-time save
  useEffect(() => {
    if (!ready || !doc.current || JSON.stringify(s) === lastSaved.current) return
    setSync('saving')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      queue.current = queue.current.then(async () => {
        const json = JSON.stringify(latest.current)
        if (json === lastSaved.current) { setSync('saved'); return }
        try { await doc.current!.set(JSON.parse(json)); lastSaved.current = json; setSync('saved') } catch { setSync('error') }
      })
    }, 800)
    return () => window.clearTimeout(timer.current)
  }, [s, ready])

  // daily net-worth snapshot for the trend line
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10), net = Math.round(totals(s).net)
    if (net <= 0) return
    const last = s.snapshots[s.snapshots.length - 1]
    if (last?.date === today && last.value === net) return
    setS(p => ({ ...p, snapshots: [...p.snapshots.filter(x => x.date !== today), { date: today, value: net }].slice(-365) }))
  }, [s])
  return <C.Provider value={{ s, set: f => setS(f), replace: setS, sync }}>{children}</C.Provider>
}
