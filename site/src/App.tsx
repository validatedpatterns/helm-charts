import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Catalog } from './components/Catalog';
import { ChartDetail } from './components/ChartDetail';
import { useCharts } from './hooks/useCharts';

function routerBasename(): string | undefined {
  const b = import.meta.env.BASE_URL.replace(/\/$/, '');
  return b === '' ? undefined : b;
}

export default function App() {
  const { charts, loading, error } = useCharts();

  return (
    <BrowserRouter basename={routerBasename()}>
      <Header />
      <main style={{ flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#b8bbbe' }}>
            Loading charts...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#c9190b' }}>
            Failed to load charts: {error}
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Catalog charts={charts} />} />
            <Route path="/charts/:name" element={<ChartDetail charts={charts} />} />
          </Routes>
        )}
      </main>
      <Footer />
    </BrowserRouter>
  );
}
