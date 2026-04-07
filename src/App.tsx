
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <MemoryRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Billing />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </MemoryRouter>
    </ThemeProvider>
  );
}

export default App;
