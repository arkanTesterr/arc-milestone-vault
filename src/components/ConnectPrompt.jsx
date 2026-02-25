import { useWeb3 } from '../context/Web3Context';

export default function ConnectPrompt() {
  const { connectWallet, isConnecting, switchChain, isCorrectChain, account } = useWeb3();

  if (account && !isCorrectChain) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <div className="glass-panel p-10 max-w-md">
          <div className="h-16 w-16 mx-auto mb-5 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <svg className="h-8 w-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-xl text-white mb-2">Wrong Network</h2>
          <p className="text-sm text-vault-muted mb-6">
            Please switch to Arc Testnet to use ARC Milestone Vault.
          </p>
          <button onClick={switchChain} className="btn-primary w-full">Switch to Arc Testnet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <div className="glass-panel p-10 max-w-md">
        <div className="h-16 w-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-arc-500/20 to-violet-500/20 border border-arc-500/30 flex items-center justify-center">
          <svg className="h-8 w-8 text-arc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
            <circle cx="16" cy="14" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <h2 className="font-display font-bold text-xl text-white mb-2">Connect Your Wallet</h2>
        <p className="text-sm text-vault-muted mb-6">
          Connect MetaMask to start creating milestone-based funding vaults on Arc Testnet.
        </p>
        <button onClick={connectWallet} disabled={isConnecting} className="btn-primary w-full">
          {isConnecting ? 'Connecting…' : 'Connect MetaMask'}
        </button>
      </div>
    </div>
  );
}
