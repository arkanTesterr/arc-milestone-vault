import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './context/Web3Context';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateVault from './pages/CreateVault';
import VaultDetail from './pages/VaultDetail';

export default function App() {
  return (
    <Web3Provider>
      <BrowserRouter>
        <div className="min-h-screen noise-bg mesh-gradient relative">
          <div className="relative z-10">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/create" element={<CreateVault />} />
                <Route path="/vault/:address" element={<VaultDetail />} />
              </Routes>
            </main>
            <footer className="border-t border-vault-border/30 py-6 mt-12">
              <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-vault-muted font-mono">
                  ARC Milestone Vault — Built on Arc Testnet
                </p>
                <p className="text-xs text-vault-muted/50 font-mono">
                  Smart Contract Treasury Protocol
                </p>
              </div>
            </footer>
          </div>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a2236',
              color: '#fff',
              border: '1px solid #283350',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </Web3Provider>
  );
}
