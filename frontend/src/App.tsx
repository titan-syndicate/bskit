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
import TerminalPage from './pages/build'
import Login from './pages/Login'
import Repos from './pages/Repos'
import AddRepo from './pages/AddRepo'

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
          <Route path="/build" element={<TerminalPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/repos" element={<Repos />} />
          <Route path="/repos/add" element={<AddRepo />} />
        </Route>
      </Routes>
    </HelmetProvider>
  )
}