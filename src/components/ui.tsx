import { useEffect, useState, type ReactNode } from 'react'

export const Card = ({ title, attn, children }: { title?: string; attn?: boolean; children: ReactNode }) => (
  <section className={'card' + (attn ? ' attn-card' : '')}>{title && <h2>{title}</h2>}{children}</section>
)
export const Stat = ({ label, value, sub, cls }: { label: string; value: ReactNode; sub?: ReactNode; cls?: string }) => (
  <Card><div className="eyebrow">{label}</div><div className={'stat-v num ' + (cls ?? '')}>{value}</div>{sub && <div className="muted num">{sub}</div>}</Card>
)
export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="field"><label>{label}</label>{children}</div>
)
export const Drawer = ({ onClose, children }: { onClose: () => void; children: ReactNode }) => (
  <><div className="drawer-bg" onClick={onClose} /><aside className="drawer">{children}</aside></>
)
export const PageHead = ({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) => (
  <header className="page-head"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div><div>{children}</div></header>
)
export const Gl = ({ v, children }: { v: number; children: ReactNode }) => <span className={'num ' + (v >= 0 ? 'gain' : 'loss')}>{children}</span>

/** Two-step confirm (the viewer blocks window.confirm). */
export function ConfirmButton({ label, confirmLabel = 'Tap again to confirm', onConfirm, className = 'btn sm' }: { label: string; confirmLabel?: string; onConfirm: () => void; className?: string }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 4000); return () => clearTimeout(t) }, [armed])
  return <button className={className + (armed ? ' warn' : '')} onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}>{armed ? confirmLabel : label}</button>
}
