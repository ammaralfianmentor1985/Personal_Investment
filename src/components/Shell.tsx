import { NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'

const links = [['/', 'Overview'], ['/stocks', 'Stocks'], ['/crypto', 'Crypto'], ['/gold', 'Gold'], ['/cash', 'Cash'], ['/expenses', 'Expenses'], ['/settings', 'Settings']]
export default function Shell() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('ledger.theme') ?? 'dark' } catch { return 'dark' } })
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem('ledger.theme', theme) } catch { /* ignore */ } }, [theme])
  return (
    <div className="app">
      <aside className="side">
        <div className="brand">Ledger</div>
        <nav className="nav">{links.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>{l}</NavLink>)}</nav>
        <button className="btn ghost sm" style={{ marginTop: 'auto' }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  )
}
