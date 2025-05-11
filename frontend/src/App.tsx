import { Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Layout } from './components/layout'

// Pages
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetails from './pages/Events/[id]'
import Orders from './pages/Orders'
import OrderDetails from './pages/Orders/[id]'
import Settings from './pages/Settings'
import TerminalPage from './pages/terminal'

export default function App() {
  return (
    <HelmetProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/terminal" element={<TerminalPage />} />
        </Route>
      </Routes>
    </HelmetProvider>
  )
}