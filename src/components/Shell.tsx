import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore, type Sync } from '../store/store'

const links = [['/', 'Overview'], ['/stocks', 'Stocks'], ['/crypto', 'Crypto'], ['/gold', 'Gold'], ['/cash', 'Cash'], ['/expenses', 'Expenses'], ['/settings', 'Settings']]
const SYNC: Record<Sync, string> = { loading: 'Connecting…', local: 'This device only', saved: 'Synced', saving: 'Saving…', error: 'Not saved' }

const resolved = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')

export default function Shell() {
  const { sync } = useStore()
  const { pathname } = useLocation()
  useEffect(() => { try { localStorage.setItem('ledger.route', pathname) } catch { /* ignore */ } }, [pathname])
  return (
    <div className="app">
      <aside className="side">
        <div className="side-top">
          <div className="brand">Ledger</div>
          <span className={'sync' + (sync === 'error' || sync === 'local' ? ' attn' : '')}>{SYNC[sync]}</span>
          <button className="btn ghost sm theme" aria-label="Switch light or dark theme" onClick={() => { document.documentElement.dataset.theme = resolved() === 'dark' ? 'light' : 'dark' }}>◐</button>
        </div>
        <nav className="nav">{links.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>{l}</NavLink>)}</nav>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  )
}
