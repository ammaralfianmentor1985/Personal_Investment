import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './styles/tokens.css'
import './styles/base.css'
import { StoreProvider } from './store/store'
import Shell from './components/Shell'
import Overview from './pages/Overview'
import Assets from './pages/Assets'
import Cash from './pages/Cash'
import Expenses from './pages/Expenses'
import Settings from './pages/Settings'

createRoot(document.getElementById('root')!).render(
  <StoreProvider>
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Overview />} />
          <Route path="stocks" element={<Assets kind="stock" />} />
          <Route path="crypto" element={<Assets kind="crypto" />} />
          <Route path="gold" element={<Assets kind="gold" />} />
          <Route path="cash" element={<Cash />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  </StoreProvider>,
)
