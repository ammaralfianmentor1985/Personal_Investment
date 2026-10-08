import { Link } from 'react-router-dom'
import { useStore } from '../store/store'
import { attention, totals, valueOf } from '../lib/calc'
import { idr, pct } from '../lib/format'
import { Card, Gl, PageHead, Stat } from '../components/ui'
import { Donut, Sparkline } from '../components/charts'
import { demo } from '../lib/demo'

export default function Overview() {
  const { s, replace } = useStore()
  const { by, net } = totals(s)
  const alerts = attention(s)
  const cost = s.holdings.reduce((a, h) => a + valueOf(h, s).costIdr, 0)
  const mkt = by.stock + by.crypto + by.gold
  const pl = mkt - cost
  const empty = s.holdings.length === 0 && s.cash.length === 0
  return (
    <>
      <PageHead eyebrow="Net worth" title="Overview" />
      <div style={{ marginBottom: 32 }}>
        <div className="hero num">{idr(net)}</div>
        {cost > 0 && <div className="muted">Unrealised P/L on investments <Gl v={pl}>{idr(pl)} ({pct(pl / cost)})</Gl></div>}
      </div>
      {empty && <Card><div className="empty">Nothing tracked yet. Start with <Link to="/stocks" className="attn">Stocks</Link> or <Link to="/cash" className="attn">Cash</Link>, or <button className="btn sm" onClick={() => replace(demo(s))}>load demo data</button></div></Card>}
      {alerts.length > 0 && <Card title="Needs attention" attn><ul style={{ paddingLeft: 16, display: 'grid', gap: 8 }}>{alerts.map(a => <li key={a} className="attn">{a}</li>)}</ul></Card>}
      {alerts.length > 0 && <div style={{ height: 24 }} />}
      <div className="grid g4">
        <Stat label="Stocks" value={idr(by.stock)} /><Stat label="Crypto" value={idr(by.crypto)} />
        <Stat label="Gold" value={idr(by.gold)} /><Stat label="Cash" value={idr(by.cash)} />
      </div>
      <div style={{ height: 24 }} />
      <div className="grid g2">
        <Card title="Allocation"><Donut data={[{ label: 'Stocks', value: by.stock }, { label: 'Crypto', value: by.crypto }, { label: 'Gold', value: by.gold }, { label: 'Cash', value: by.cash }]} /></Card>
        <Card title="Net worth trend"><Sparkline points={s.snapshots.slice(-30).map(x => x.value)} /></Card>
      </div>
    </>
  )
}
