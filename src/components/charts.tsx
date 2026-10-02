const COLORS = ['#e8e4d8', '#6fc29a', '#9fb3a9', '#4f6b5f']
export function Donut({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1
  const R = 64, C = 2 * Math.PI * R
  let off = 0
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg width="160" height="160" viewBox="0 0 160 160" role="img" aria-label="Allocation">
        <circle cx="80" cy="80" r={R} fill="none" stroke="var(--raised)" strokeWidth="16" />
        {data.map((d, i) => {
          const len = (d.value / total) * C, el = (
            <circle key={d.label} cx="80" cy="80" r={R} fill="none" stroke={COLORS[i % 4]} strokeWidth="16"
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform="rotate(-90 80 80)" />)
          off += len; return el
        })}
      </svg>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
        {data.map((d, i) => (
          <li key={d.label} className="row" style={{ minHeight: 24, gap: 16 }}>
            <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: COLORS[i % 4], marginRight: 8 }} />{d.label}</span>
            <span className="num muted">{((d.value / total) * 100).toFixed(0)}%</span>
          </li>))}
      </ul>
    </div>
  )
}
export function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return <div className="muted">Trend appears after a couple of days of data.</div>
  const w = 480, h = 96, min = Math.min(...points), max = Math.max(...points), span = max - min || 1
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${(i / (points.length - 1)) * w},${h - 8 - ((p - min) / span) * (h - 16)}`).join(' ')
  return <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none"><path d={d} fill="none" stroke="var(--text)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>
}
