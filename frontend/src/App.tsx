import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApplicationLayout } from './components/application-layout';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';

function App() {
  return (
    <Router>
      <ApplicationLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </ApplicationLayout>
    </Router>
  );
}

export default App;
