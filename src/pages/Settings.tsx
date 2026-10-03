import { useEffect, useRef, useState } from 'react'
import { useStore, initial } from '../store/store'
import { Card, ConfirmButton, Field, PageHead } from '../components/ui'

type Downloads = { save(r: { filename: string; data: string }): Promise<unknown> }

export default function Settings() {
  const { s, set, replace, sync } = useStore()
  const [msg, setMsg] = useState('')
  const [dl, setDl] = useState<Downloads | null>(null)
  const file = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const c = (window as unknown as { claude?: { use?: (n: string) => Promise<any> } }).claude
    c?.use?.('downloads')?.then((d: Downloads | null) => setDl(d)).catch(() => setDl(null))
  }, [])
  const sum = Object.values(s.targets).reduce((a, b) => a + b, 0)
  const exportJson = async () => {
    try { await dl?.save({ filename: `ledger-${new Date().toISOString().slice(0, 10)}.json`, data: JSON.stringify(s, null, 2) }); setMsg('Backup saved.') }
    catch { setMsg('Backup was not saved.') }
  }
  return (
    <>
      <PageHead eyebrow="Preferences & data" title="Settings" />
      <div className="grid g2">
        <Card title="Prices & exchange rate">
          <p className="muted" style={{ marginBottom: 16 }}>Live prices cannot load inside Claude, so you set them. Edit a price directly in any table, or open a holding. Prices older than 30 days are flagged.</p>
          <div className="form"><Field label="USD → IDR"><input type="number" inputMode="decimal" value={s.fx.usdIdr} onChange={e => set(p => ({ ...p, fx: { ...p.fx, usdIdr: Number(e.target.value), manual: true, asOf: Date.now() } }))} /></Field></div>
        </Card>
        <Card title="Target allocation (%)">
          <div className="form">{(['stock', 'crypto', 'gold', 'cash'] as const).map(k => <Field key={k} label={k}><input type="number" inputMode="decimal" value={s.targets[k]} onChange={e => set(p => ({ ...p, targets: { ...p.targets, [k]: Number(e.target.value) } }))} /></Field>)}</div>
          <span className={sum === 100 ? 'muted' : 'attn'}>Total {sum}%</span>
        </Card>
        <Card title="Monthly budgets (IDR)">
          <div className="form">{Object.entries(s.budgets).map(([k, v]) => <Field key={k} label={k}><input type="number" inputMode="decimal" value={v} onChange={e => set(p => ({ ...p, budgets: { ...p.budgets, [k]: Number(e.target.value) } }))} /></Field>)}</div>
        </Card>
        <Card title="Your data">
          <p className={sync === 'local' || sync === 'error' ? 'attn' : 'muted'} style={{ marginBottom: 16 }}>
            {sync === 'saved' || sync === 'saving' ? 'Saved to your private Claude account, so it follows you to any device where you open this page while signed in.' : sync === 'loading' ? 'Connecting to your private storage…' : sync === 'error' ? 'Your last change could not be saved. Check your connection and edit again.' : 'Cloud storage is unavailable here. Data stays on this device only.'}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {dl && <button className="btn" onClick={exportJson}>Export backup</button>}
            <button className="btn" onClick={() => file.current?.click()}>Import backup</button>
            <ConfirmButton className="btn" label="Reset everything" confirmLabel="Tap again to erase" onConfirm={() => { replace(initial); setMsg('All data erased.') }} />
            <input ref={file} type="file" accept="application/json" hidden onChange={async e => { const f = e.target.files?.[0]; if (!f) return; try { replace({ ...initial, ...JSON.parse(await f.text()) }); setMsg('Imported.') } catch { setMsg('Could not read that file.') } }} />
          </div>
          {msg && <p className="muted" style={{ marginTop: 16 }}>{msg}</p>}
        </Card>
      </div>
    </>
  )
}
