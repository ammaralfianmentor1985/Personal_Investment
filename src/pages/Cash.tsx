import { useState } from 'react'
import { useStore } from '../store/store'
import { toIdr, uid, totals } from '../lib/calc'
import { idr } from '../lib/format'
import { Card, Field, PageHead } from '../components/ui'
import type { Currency } from '../lib/types'

export default function Cash() {
  const { s, set } = useStore()
  const [f, setF] = useState({ name: '', currency: 'IDR' as Currency, balance: '' })
  const add = () => { if (!f.name.trim()) return; set(p => ({ ...p, cash: [...p.cash, { id: uid(), name: f.name.trim(), currency: f.currency, balance: Number(f.balance) || 0 }] })); setF({ ...f, name: '', balance: '' }) }
  return (
    <>
      <PageHead eyebrow="Banks, e-wallets, physical cash" title="Cash"><div className="eyebrow">Total</div><div className="num stat-v">{idr(totals(s).by.cash)}</div></PageHead>
      <Card>
        <div className="form">
          <Field label="Account"><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Currency"><select value={f.currency} onChange={e => setF({ ...f, currency: e.target.value as Currency })}><option>IDR</option><option>USD</option></select></Field>
          <Field label="Balance"><input type="number" value={f.balance} onChange={e => setF({ ...f, balance: e.target.value })} /></Field>
          <button className="btn primary" onClick={add}>Add account</button>
        </div>
        {s.cash.length === 0 ? <div className="empty">No accounts yet.</div> : <table><thead><tr><th>Account</th><th>Balance</th><th>In IDR</th><th /></tr></thead>
          <tbody>{s.cash.map(c => <tr key={c.id}>
            <td>{c.name}</td>
            <td><input className="num" style={{ width: 160, textAlign: 'right', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, height: 32, padding: '0 8px' }} type="number" value={c.balance} onChange={e => set(p => ({ ...p, cash: p.cash.map(x => x.id === c.id ? { ...x, balance: Number(e.target.value) } : x) }))} /> <span className="muted">{c.currency}</span></td>
            <td className="num">{idr(toIdr(c.balance, c.currency, s.fx.usdIdr))}</td>
            <td><button className="btn ghost sm" onClick={() => set(p => ({ ...p, cash: p.cash.filter(x => x.id !== c.id) }))}>✕</button></td></tr>)}</tbody></table>}
      </Card>
    </>
  )
}
