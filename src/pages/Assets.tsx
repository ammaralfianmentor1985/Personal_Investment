import { useState } from 'react'
import { useStore } from '../store/store'
import { valueOf, uid, totals } from '../lib/calc'
import { money, pct, qtyFmt, idr } from '../lib/format'
import { Card, ConfirmButton, Drawer, Field, Gl, PageHead } from '../components/ui'
import type { Currency, Holding, Kind } from '../lib/types'

const META: Record<Kind, { title: string; unit: string; hint: string; sym: string }> = {
  stock: { title: 'Stocks', unit: 'Shares', hint: 'IDX tickers end in .JK, e.g. BMRI.JK', sym: 'Ticker' },
  crypto: { title: 'Crypto', unit: 'Units', hint: 'Name or ticker, e.g. Bitcoin or BTC', sym: 'Coin' },
  gold: { title: 'Gold', unit: 'Grams', hint: 'Price per gram in IDR', sym: 'Label' },
}

export default function Assets({ kind }: { kind: Kind }) {
  const { s, set } = useStore()
  const m = META[kind]
  const rows = s.holdings.filter(h => h.kind === kind)
  const [open, setOpen] = useState<string | null>(null)
  const [f, setF] = useState({ symbol: kind === 'gold' ? 'XAU' : '', name: '', currency: (kind === 'stock' ? 'IDR' : kind === 'gold' ? 'IDR' : 'USD') as Currency })
  const kindTotal = totals(s).by[kind]
  const add = () => {
    if (!f.symbol.trim()) return
    const h: Holding = { id: uid(), kind, symbol: f.symbol.trim(), name: f.name.trim() || f.symbol.trim(), currency: kind === 'gold' ? 'IDR' : f.currency, lots: [] }
    set(p => ({ ...p, holdings: [...p.holdings, h] })); setOpen(h.id); setF({ ...f, symbol: kind === 'gold' ? 'XAU' : '', name: '' })
  }
  const sel = s.holdings.find(h => h.id === open)
  return (
    <>
      <PageHead eyebrow={m.hint} title={m.title}><div className="eyebrow">Total</div><div className="num stat-v">{idr(kindTotal)}</div></PageHead>
      <Card>
        <div className="form">
          <Field label={m.sym}><input value={f.symbol} onChange={e => setF({ ...f, symbol: e.target.value })} /></Field>
          <Field label="Name"><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
          {kind !== 'gold' && <Field label="Currency"><select value={f.currency} onChange={e => setF({ ...f, currency: e.target.value as Currency })}><option>IDR</option><option>USD</option></select></Field>}
          <button className="btn primary" onClick={add}>Add {kind === 'gold' ? 'position' : 'holding'}</button>
        </div>
        {rows.length === 0 ? <div className="empty">No {m.title.toLowerCase()} yet. Add one above, then record your first buy.</div> : (
          <div className="scroll"><table className="assets">
            <thead><tr><th>{m.sym}</th><th>{m.unit}</th><th>Avg cost</th><th>Price</th><th>Value (IDR)</th><th>P/L</th><th>MoS</th></tr></thead>
            <tbody>{rows.map(h => { const v = valueOf(h, s); return (
              <tr key={h.id} className="click" onClick={() => setOpen(h.id)}>
                <td>{h.symbol.toUpperCase()} <span className="muted nm">{h.name !== h.symbol ? h.name : ''}</span> {v.stale && v.qty > 0 && <span className="pill">update price</span>}</td>
                <td className="num">{qtyFmt(v.qty)}</td>
                <td className="num">{money(v.avg, h.currency)}</td>
                <td onClick={e => e.stopPropagation()}><input className="price-in num" type="number" inputMode="decimal" aria-label={`Price of ${h.symbol}`} value={h.manualPrice ?? ''} placeholder={String(Math.round(v.price * 100) / 100)} onChange={e => set(p => ({ ...p, holdings: p.holdings.map(x => x.id === h.id ? { ...x, manualPrice: e.target.value === '' ? undefined : Number(e.target.value), manualAt: Date.now() } : x) }))} /></td>
                <td className="num">{idr(v.valueIdr)}</td>
                <td><Gl v={v.pl}>{pct(v.plPct)}</Gl></td>
                <td className={'num ' + (v.mos != null && v.mos < 0 ? 'attn' : '')}>{v.mos != null ? pct(v.mos) : '—'}</td>
              </tr>) })}</tbody>
          </table></div>)}
      </Card>
      {sel && <Detail h={sel} unit={m.unit} onClose={() => setOpen(null)} />}
    </>
  )
}

function Detail({ h, unit, onClose }: { h: Holding; unit: string; onClose: () => void }) {
  const { s, set } = useStore()
  const [tab, setTab] = useState<'summary' | 'tx' | 'notes'>('summary')
  const [lot, setLot] = useState({ date: new Date().toISOString().slice(0, 10), side: 'buy' as 'buy' | 'sell', qty: '', price: '' })
  const v = valueOf(h, s)
  const upd = (patch: Partial<Holding>) => set(p => ({ ...p, holdings: p.holdings.map(x => x.id === h.id ? { ...x, ...patch } : x) }))
  const num = (x: string) => (x === '' ? undefined : Number(x))
  const addLot = () => {
    const qty = Number(lot.qty), price = Number(lot.price)
    if (!(qty > 0) || !(price >= 0)) return
    upd({ lots: [...h.lots, { id: uid(), date: lot.date, side: lot.side, qty, price }] }); setLot({ ...lot, qty: '', price: '' })
  }
  return (
    <Drawer onClose={onClose}>
      <div className="row"><div><div className="eyebrow">{h.kind}</div><h1>{h.symbol.toUpperCase()}</h1></div><button className="btn ghost sm" onClick={onClose}>Close</button></div>
      <div className="tabs">{(['summary', 'tx', 'notes'] as const).map(t => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t === 'tx' ? 'Transactions' : t[0].toUpperCase() + t.slice(1)}</button>)}</div>
      {tab === 'summary' && <div className="grid">
        {([['Quantity', qtyFmt(v.qty)], ['Average cost', money(v.avg, h.currency)], ['Price', money(v.price, h.currency)], ['Market value', money(v.value, h.currency)], ['Unrealised P/L', money(v.pl, h.currency) + ' (' + pct(v.plPct) + ')'], ['Margin of safety', v.mos != null ? pct(v.mos) : 'Set an intrinsic value in Notes']] as const).map(([k, val]) =>
          <div className="row" key={k}><span className="muted">{k}</span><span className="num">{val}</span></div>)}
        <div className="form" style={{ marginTop: 16 }}>
          <Field label={`Current price (${h.currency})`}><input type="number" value={h.manualPrice ?? ''} placeholder="not set" onChange={e => upd({ manualPrice: num(e.target.value), manualAt: Date.now() })} /></Field>
        </div>
        <ConfirmButton label="Delete holding" onConfirm={() => { set(p => ({ ...p, holdings: p.holdings.filter(x => x.id !== h.id) })); onClose() }} />
      </div>}
      {tab === 'tx' && <>
        <div className="form">
          <Field label="Date"><input type="date" value={lot.date} onChange={e => setLot({ ...lot, date: e.target.value })} /></Field>
          <Field label="Side"><select value={lot.side} onChange={e => setLot({ ...lot, side: e.target.value as 'buy' | 'sell' })}><option>buy</option><option>sell</option></select></Field>
          <Field label={unit}><input type="number" value={lot.qty} onChange={e => setLot({ ...lot, qty: e.target.value })} /></Field>
          <Field label={`Price (${h.currency})`}><input type="number" value={lot.price} onChange={e => setLot({ ...lot, price: e.target.value })} /></Field>
          <button className="btn primary" onClick={addLot}>Add</button>
        </div>
        {h.lots.length === 0 ? <div className="empty">No transactions yet.</div> : <table><thead><tr><th>Date</th><th>Side</th><th>{unit}</th><th>Price</th><th /></tr></thead>
          <tbody>{[...h.lots].sort((a, b) => b.date.localeCompare(a.date)).map(l => <tr key={l.id}><td className="num">{l.date}</td><td>{l.side}</td><td className="num">{qtyFmt(l.qty)}</td><td className="num">{money(l.price, h.currency)}</td><td><button className="btn ghost sm" onClick={() => upd({ lots: h.lots.filter(x => x.id !== l.id) })}>✕</button></td></tr>)}</tbody></table>}
      </>}
      {tab === 'notes' && <div className="grid">
        <Field label={`Intrinsic value per unit (${h.currency})`}><input type="number" value={h.intrinsic ?? ''} onChange={e => upd({ intrinsic: num(e.target.value) })} /></Field>
        <Field label={`Dividends received (${h.currency})`}><input type="number" value={h.dividends ?? ''} onChange={e => upd({ dividends: num(e.target.value) })} /></Field>
        <Field label="Investment thesis"><textarea value={h.thesis ?? ''} placeholder="Why do you own this? What would make you sell?" onChange={e => upd({ thesis: e.target.value })} /></Field>
      </div>}
    </Drawer>
  )
}
