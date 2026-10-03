import { useState } from 'react'
import { useStore } from '../store/store'
import { uid, monthOf } from '../lib/calc'
import { idr } from '../lib/format'
import { Card, Field, PageHead } from '../components/ui'

const CATS = ['Food', 'Transport', 'Housing', 'Bills', 'Health', 'Leisure', 'Other']
export default function Expenses() {
  const { s, set } = useStore()
  const today = new Date().toISOString().slice(0, 10)
  const [f, setF] = useState({ date: today, amount: '', category: 'Food', note: '' })
  const [month, setMonth] = useState(today.slice(0, 7))
  const list = s.expenses.filter(e => monthOf(e.date) === month).sort((a, b) => b.date.localeCompare(a.date))
  const total = list.reduce((a, e) => a + e.amount, 0)
  const byCat: Record<string, number> = {}
  for (const e of list) byCat[e.category] = (byCat[e.category] ?? 0) + e.amount
  const cats = [...new Set([...CATS, ...Object.keys(s.budgets)])]
  const add = () => { const amount = Number(f.amount); if (!(amount > 0)) return; set(p => ({ ...p, expenses: [...p.expenses, { id: uid(), date: f.date, amount, category: f.category, note: f.note }] })); setF({ ...f, amount: '', note: '' }) }
  return (
    <>
      <PageHead eyebrow="Monthly spending" title="Expenses">
        <div className="field"><label>Month</label><input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ height: 40, padding: '0 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }} /></div>
      </PageHead>
      <div className="grid g2">
        <Card title="Add expense">
          <div className="form">
            <Field label="Date"><input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></Field>
            <Field label="Amount (IDR)"><input type="number" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} /></Field>
            <Field label="Category"><select value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{cats.map(c => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Note"><input value={f.note} onChange={e => setF({ ...f, note: e.target.value })} /></Field>
            <button className="btn primary" onClick={add}>Add</button>
          </div>
        </Card>
        <Card title="This month by category">
          <div className="eyebrow">Total</div><div className="num stat-v" style={{ marginBottom: 16 }}>{idr(total)}</div>
          <div className="grid" style={{ gap: 16 }}>
            {cats.filter(c => byCat[c] || s.budgets[c]).map(c => { const spent = byCat[c] ?? 0, b = s.budgets[c] ?? 0, over = b > 0 && spent > b
              return <div key={c}><div className="row" style={{ minHeight: 24 }}><span>{c} {over && <span className="pill">over budget</span>}</span><span className="num muted">{idr(spent)}{b > 0 && ` / ${idr(b)}`}</span></div>
                <div className={'bar' + (over ? ' over' : '')}><i style={{ width: `${Math.min(100, b > 0 ? (spent / b) * 100 : total ? (spent / total) * 100 : 0)}%` }} /></div></div> })}
          </div>
        </Card>
      </div>
      <div style={{ height: 24 }} />
      <Card title="Transactions">
        {list.length === 0 ? <div className="empty">No expenses this month.</div> : <div className="scroll"><table><thead><tr><th>Date</th><th>Category</th><th>Note</th><th>Amount</th><th /></tr></thead>
          <tbody>{list.map(e => <tr key={e.id}><td className="num">{e.date}</td><td style={{ textAlign: 'right' }}>{e.category}</td><td className="muted" style={{ textAlign: 'right' }}>{e.note}</td><td className="num">{idr(e.amount)}</td><td><button className="btn ghost sm" onClick={() => set(p => ({ ...p, expenses: p.expenses.filter(x => x.id !== e.id) }))}>✕</button></td></tr>)}</tbody></table></div>}
      </Card>
    </>
  )
}
