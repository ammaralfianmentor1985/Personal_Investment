import { useRef, useState } from 'react'
import { useStore, initial } from '../store/store'
import { refreshAll } from '../lib/prices'
import { Card, Field, PageHead } from '../components/ui'

export default function Settings() {
  const { s, set, replace } = useStore()
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const refresh = async () => {
    setBusy(true); setMsg('')
    const r = await refreshAll(s)
    set(p => ({ ...p, quotes: r.quotes, fx: r.fx && !p.fx.manual ? { ...p.fx, usdIdr: r.fx, asOf: Date.now() } : p.fx }))
    setMsg(r.errors.length ? `Could not fetch: ${r.errors.join(', ')}. Cached or manual values are kept.` : 'Prices updated.'); setBusy(false)
  }
  const sum = Object.values(s.targets).reduce((a, b) => a + b, 0)
  return (
    <>
      <PageHead eyebrow="Preferences & data" title="Settings" />
      <div className="grid g2">
        <Card title="Prices & FX">
          <div className="form">
            <Field label="USD → IDR"><input type="number" value={s.fx.usdIdr} onChange={e => set(p => ({ ...p, fx: { ...p.fx, usdIdr: Number(e.target.value), manual: true } }))} /></Field>
            <Field label="FX mode"><select value={s.fx.manual ? 'manual' : 'auto'} onChange={e => set(p => ({ ...p, fx: { ...p.fx, manual: e.target.value === 'manual' } }))}><option value="auto">Auto</option><option value="manual">Manual</option></select></Field>
          </div>
          <button className="btn primary" onClick={refresh} disabled={busy}>{busy ? 'Refreshing…' : 'Refresh prices'}</button>
          {msg && <p className={msg.startsWith('Could') ? 'attn' : 'muted'} style={{ marginTop: 16 }}>{msg}</p>}
          <p className="muted" style={{ marginTop: 16 }}>Stock quotes may be blocked by the browser; set a manual price on any holding as a fallback.</p>
        </Card>
        <Card title="Target allocation (%)">
          <div className="form">{(['stock', 'crypto', 'gold', 'cash'] as const).map(k => <Field key={k} label={k}><input type="number" value={s.targets[k]} onChange={e => set(p => ({ ...p, targets: { ...p.targets, [k]: Number(e.target.value) } }))} /></Field>)}</div>
          <span className={sum === 100 ? 'muted' : 'attn'}>Total {sum}%</span>
        </Card>
        <Card title="Monthly budgets (IDR)">
          <div className="form">{Object.entries(s.budgets).map(([k, v]) => <Field key={k} label={k}><input type="number" value={v} onChange={e => set(p => ({ ...p, budgets: { ...p.budgets, [k]: Number(e.target.value) } }))} /></Field>)}</div>
        </Card>
        <Card title="Your data">
          <p className="muted" style={{ marginBottom: 16 }}>Everything is stored only in this browser. Export a backup regularly.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' })); a.download = `ledger-${new Date().toISOString().slice(0, 10)}.json`; a.click() }}>Export JSON</button>
            <button className="btn" onClick={() => file.current?.click()}>Import JSON</button>
            <button className="btn" onClick={() => { if (confirm('Erase all data?')) replace(initial) }}>Reset</button>
            <input ref={file} type="file" accept="application/json" hidden onChange={async e => { const f = e.target.files?.[0]; if (!f) return; try { replace({ ...initial, ...JSON.parse(await f.text()) }); setMsg('Imported.') } catch { setMsg('Could not read that file.') } }} />
          </div>
        </Card>
      </div>
    </>
  )
}
