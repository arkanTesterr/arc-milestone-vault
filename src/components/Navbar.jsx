import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { shortenAddress } from '../utils/helpers';

const NAV_LINKS = [
  { to: '/',         label: 'Dashboard' },
  { to: '/create',   label: 'Create Vault' },
];

export default function Navbar() {
  const { account, isConnecting, isCorrectChain, connectWallet, switchChain, disconnect } = useWeb3();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-vault-border/60 bg-vault-dark/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-arc-500 to-violet-500 flex items-center justify-center shadow-lg shadow-arc-600/20 group-hover:shadow-arc-500/30 transition-shadow">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20V10l8-6 8 6v10H4z" />
              <circle cx="12" cy="14" r="2.5" />
              <line x1="12" y1="16.5" x2="12" y2="20" />
            </svg>
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight text-white">
              ARC <span className="text-arc-400">Milestone</span>
            </span>
            <span className="hidden sm:block text-[10px] font-mono text-vault-muted uppercase tracking-widest -mt-0.5">
              Vault Protocol
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg font-display text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-arc-600/15 text-arc-400'
                    : 'text-vault-muted hover:text-white hover:bg-vault-surface/50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Wallet */}
        <div className="flex items-center gap-3">
          {account && !isCorrectChain && (
            <button onClick={switchChain} className="btn-danger text-xs py-2 px-3">
              Wrong Network
            </button>
          )}

          {!account ? (
            <button onClick={connectWallet} disabled={isConnecting} className="btn-primary text-sm">
              {isConnecting ? (
                <>
                  <Spinner /> Connecting…
                </>
              ) : (
                <>
                  <WalletIcon /> Connect Wallet
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 glass-panel text-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs text-vault-muted">{shortenAddress(account)}</span>
              </div>
              <button onClick={disconnect} className="btn-secondary text-sm py-2 px-3" title="Disconnect">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <circle cx="16" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}
