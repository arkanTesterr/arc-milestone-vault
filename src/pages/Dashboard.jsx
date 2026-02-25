import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import ConnectPrompt from '../components/ConnectPrompt';
import { StatCard, LoadingSpinner, EmptyState, SectionHeader } from '../components/UI';
import MilestoneVaultABI from '../abi/MilestoneVault.json';
import { formatUSDC, shortenAddress, formatDate } from '../utils/helpers';
import { CONTRACTS } from '../utils/constants';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { account, isCorrectChain, getFactoryContract, provider } = useWeb3();
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({ totalVaults: 0, totalDeposited: 0, totalReleased: 0, totalMilestones: 0 });

  const fetchVaults = useCallback(async () => {
    const factory = getFactoryContract();
    if (!factory || !account) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const addrs = await factory.getUserVaults(account);
      const vaultData = await Promise.all(
        addrs.map(async (addr) => {
          try {
            const vault = new ethers.Contract(addr, MilestoneVaultABI, provider);
            const [name, stats] = await Promise.all([
              vault.vaultName(),
              vault.getVaultStats(),
            ]);
            return {
              address: addr,
              name,
              totalDeposited: stats.totalDeposited,
              totalReleased: stats.totalReleased,
              totalLocked: stats.totalLocked,
              milestoneCount: Number(stats.milestoneCount),
              completedMilestones: Number(stats.completedMilestones),
              pendingMilestones: Number(stats.pendingMilestones),
            };
          } catch {
            return { address: addr, name: 'Unknown Vault', milestoneCount: 0, completedMilestones: 0, pendingMilestones: 0, totalDeposited: 0n, totalReleased: 0n, totalLocked: 0n };
          }
        })
      );

      setVaults(vaultData);

      const totals = vaultData.reduce(
        (acc, v) => ({
          totalVaults: acc.totalVaults + 1,
          totalDeposited: acc.totalDeposited + BigInt(v.totalDeposited || 0),
          totalReleased: acc.totalReleased + BigInt(v.totalReleased || 0),
          totalMilestones: acc.totalMilestones + v.milestoneCount,
        }),
        { totalVaults: 0, totalDeposited: 0n, totalReleased: 0n, totalMilestones: 0 }
      );
      setGlobalStats(totals);
    } catch (err) {
      console.error('fetchVaults error:', err);
    } finally {
      setLoading(false);
    }
  }, [getFactoryContract, account, provider]);

  useEffect(() => {
    if (account && isCorrectChain) fetchVaults();
  }, [account, isCorrectChain, fetchVaults]);

  if (!account || !isCorrectChain) return <ConnectPrompt />;

  return (
    <div className="animate-fade-in">
      {/* Hero Stats */}
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-1">Dashboard</h1>
        <p className="text-vault-muted text-sm">Overview of your milestone funding vaults on Arc Testnet.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={<VaultIcon />}
          label="Total Vaults"
          value={globalStats.totalVaults}
          accent
        />
        <StatCard
          icon={<DepositIcon />}
          label="Total Deposited"
          value={`$${formatUSDC(globalStats.totalDeposited)}`}
        />
        <StatCard
          icon={<ReleaseIcon />}
          label="Total Released"
          value={`$${formatUSDC(globalStats.totalReleased)}`}
        />
        <StatCard
          icon={<MsIcon />}
          label="Total Milestones"
          value={globalStats.totalMilestones}
        />
      </div>

      {/* Vaults List */}
      <SectionHeader
        title="Your Vaults"
        subtitle={`${vaults.length} vault${vaults.length !== 1 ? 's' : ''} found`}
        actions={
          <div className="flex gap-2">
            <MintUSDCButton />
            <Link to="/create" className="btn-primary text-sm">
              <PlusIcon /> New Vault
            </Link>
          </div>
        }
      />

      {loading ? (
        <LoadingSpinner text="Fetching your vaults…" />
      ) : vaults.length === 0 ? (
        <EmptyState
          icon={<EmptyVaultIcon />}
          title="No Vaults Yet"
          description="Create your first milestone-based funding vault to get started."
          action={
            <Link to="/create" className="btn-primary">
              Create Your First Vault
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vaults.map((v, idx) => (
            <VaultCard key={v.address} vault={v} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Vault Card ─────────────────────────────────────────────
function VaultCard({ vault, index }) {
  const pct = vault.milestoneCount > 0
    ? Math.round((vault.completedMilestones / vault.milestoneCount) * 100)
    : 0;

  return (
    <Link
      to={`/vault/${vault.address}`}
      className="glass-panel-hover p-5 block"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-lg text-white mb-0.5">{vault.name}</h3>
          <p className="font-mono text-xs text-vault-muted">{shortenAddress(vault.address, 6)}</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-arc-600/15 text-arc-400 text-xs font-display font-semibold">
          {vault.milestoneCount} ms
        </div>
      </div>

      {/* Mini progress */}
      <div className="mb-4">
        <div className="h-1.5 w-full bg-vault-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-arc-500 to-violet-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[11px] text-vault-muted font-mono">{vault.completedMilestones}/{vault.milestoneCount} done</span>
          <span className="text-[11px] text-arc-400 font-mono">{pct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-vault-dark/60 rounded-lg p-2.5">
          <p className="text-[10px] text-vault-muted uppercase font-display tracking-wider">Locked</p>
          <p className="text-sm font-display font-bold text-white">${formatUSDC(vault.totalLocked)}</p>
        </div>
        <div className="bg-vault-dark/60 rounded-lg p-2.5">
          <p className="text-[10px] text-vault-muted uppercase font-display tracking-wider">Released</p>
          <p className="text-sm font-display font-bold text-emerald-400">${formatUSDC(vault.totalReleased)}</p>
        </div>
      </div>
    </Link>
  );
}

// ─── Icons ──────────────────────────────────────────────────
function VaultIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10l8-6 8 6v10H4z" />
      <circle cx="12" cy="14" r="2" />
    </svg>
  );
}
function DepositIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 7l-5-5-5 5" />
    </svg>
  );
}
function ReleaseIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V2M7 17l5 5 5-5" />
    </svg>
  );
}
function MsIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function EmptyVaultIcon() {
  return (
    <svg className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10l8-6 8 6v10H4z" />
      <circle cx="12" cy="14" r="2.5" />
      <line x1="12" y1="16.5" x2="12" y2="20" />
    </svg>
  );
}

function MintUSDCButton() {
  const { signer } = useWeb3();
  const [minting, setMinting] = useState(false);

  const handleMint = async () => {
    if (!signer) return;
    setMinting(true);
    try {
      const usdc = new ethers.Contract(
        CONTRACTS.USDC,
        ['function faucet() external'],
        signer
      );
      const tx = await usdc.faucet();
      await tx.wait();
      toast.success('10,000 Test USDC minted to your wallet!');
    } catch (err) {
      toast.error('Mint failed: ' + (err?.reason || err?.message || 'Unknown error'));
    } finally {
      setMinting(false);
    }
  };

  return (
    <button onClick={handleMint} disabled={minting} className="btn-secondary text-sm whitespace-nowrap">
      {minting ? 'Minting…' : '🪙 Mint USDC'}
    </button>
  );
}
