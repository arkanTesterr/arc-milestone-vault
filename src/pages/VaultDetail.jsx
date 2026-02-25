import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useVault } from '../hooks/useVault';
import ConnectPrompt from '../components/ConnectPrompt';
import { StatusBadge, ProgressBar, StatCard, LoadingSpinner, SectionHeader, EmptyState } from '../components/UI';
import { formatUSDC, shortenAddress, formatDate, formatDateTime, timeRemaining, isExpired } from '../utils/helpers';
import { ARC_TESTNET } from '../utils/constants';

export default function VaultDetail() {
  const { address } = useParams();
  const { account, isCorrectChain } = useWeb3();
  const {
    loading: txLoading,
    fetchVaultData,
    depositFunds,
    addMilestone,
    submitMilestone,
    approveMilestone,
    rejectMilestone,
    releasePayment,
  } = useVault(address);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('milestones');

  // ─── Form states ──────────────────────────────────────────
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [msTitle, setMsTitle] = useState('');
  const [msDesc, setMsDesc] = useState('');
  const [msAmount, setMsAmount] = useState('');
  const [msDeadline, setMsDeadline] = useState('');

  const isOwner = data?.owner?.toLowerCase() === account?.toLowerCase();

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchVaultData();
    if (result) setData(result);
    setLoading(false);
  }, [fetchVaultData]);

  useEffect(() => {
    if (account && isCorrectChain) refresh();
  }, [account, isCorrectChain, refresh]);

  if (!account || !isCorrectChain) return <ConnectPrompt />;
  if (loading) return <LoadingSpinner text="Loading vault data…" />;
  if (!data) return <EmptyState icon={<ErrorIcon />} title="Vault Not Found" description="Could not load vault data at this address." />;

  const stats = data.stats;
  const milestones = data.milestones || [];
  const transactions = data.transactions || [];
  const completed = Number(stats.completedMilestones);
  const total = Number(stats.milestoneCount);

  const handleDeposit = async (e) => {
    e.preventDefault();
    await depositFunds(depositAmount);
    setDepositAmount('');
    setShowDepositForm(false);
    refresh();
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    await addMilestone(msTitle, msDesc, msAmount, msDeadline);
    setMsTitle(''); setMsDesc(''); setMsAmount(''); setMsDeadline('');
    setShowMilestoneForm(false);
    refresh();
  };

  const handleAction = async (action, id) => {
    try {
      if (action === 'submit') await submitMilestone(id);
      else if (action === 'approve') await approveMilestone(id);
      else if (action === 'reject') await rejectMilestone(id);
      else if (action === 'release') await releasePayment(id);
      refresh();
    } catch {}
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <Link to="/" className="text-vault-muted hover:text-arc-400 transition-colors">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">{data.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="font-mono text-xs text-vault-muted">{shortenAddress(address, 8)}</span>
            {isOwner && (
              <span className="status-badge bg-arc-600/15 text-arc-400 border border-arc-500/30">Owner</span>
            )}
            <a
              href={`${ARC_TESTNET.explorer}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-vault-muted hover:text-arc-400 transition-colors flex items-center gap-1"
            >
              View on Explorer
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowDepositForm(!showDepositForm)} className="btn-primary text-sm">
            Deposit USDC
          </button>
          {isOwner && (
            <button onClick={() => setShowMilestoneForm(!showMilestoneForm)} className="btn-secondary text-sm">
              Add Milestone
            </button>
          )}
          <MintUSDCButton />
        </div>
      </div>

      {/* Deposit Form */}
      {showDepositForm && (
        <div className="glass-panel p-6 mb-6 animate-slide-up">
          <h3 className="font-display font-bold text-white mb-4">Deposit USDC</h3>
          <form onSubmit={handleDeposit} className="flex gap-3">
            <input
              type="number"
              step="0.01"
              min="0"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Amount (USDC)"
              className="input-field flex-1"
              disabled={txLoading}
            />
            <button type="submit" disabled={txLoading || !depositAmount} className="btn-primary shrink-0">
              {txLoading ? 'Processing…' : 'Deposit'}
            </button>
            <button type="button" onClick={() => setShowDepositForm(false)} className="btn-secondary shrink-0">Cancel</button>
          </form>
        </div>
      )}

      {/* Add Milestone Form */}
      {showMilestoneForm && (
        <div className="glass-panel p-6 mb-6 animate-slide-up">
          <h3 className="font-display font-bold text-white mb-4">Add New Milestone</h3>
          <form onSubmit={handleAddMilestone} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-display text-vault-muted mb-1">Title</label>
                <input type="text" value={msTitle} onChange={(e) => setMsTitle(e.target.value)} placeholder="Milestone title" className="input-field" disabled={txLoading} />
              </div>
              <div>
                <label className="block text-xs font-display text-vault-muted mb-1">Amount (USDC)</label>
                <input type="number" step="0.01" min="0" value={msAmount} onChange={(e) => setMsAmount(e.target.value)} placeholder="500.00" className="input-field" disabled={txLoading} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-display text-vault-muted mb-1">Description</label>
              <textarea value={msDesc} onChange={(e) => setMsDesc(e.target.value)} placeholder="Describe what this milestone entails…" className="input-field min-h-[80px] resize-y" disabled={txLoading} />
            </div>
            <div className="sm:w-1/2">
              <label className="block text-xs font-display text-vault-muted mb-1">Deadline</label>
              <input type="datetime-local" value={msDeadline} onChange={(e) => setMsDeadline(e.target.value)} className="input-field" disabled={txLoading} />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={txLoading || !msTitle || !msAmount || !msDeadline} className="btn-primary">
                {txLoading ? 'Adding…' : 'Add Milestone'}
              </button>
              <button type="button" onClick={() => setShowMilestoneForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<LockedIcon />} label="Locked" value={`$${formatUSDC(stats.totalLocked)}`} accent />
        <StatCard icon={<DepositedIcon />} label="Deposited" value={`$${formatUSDC(stats.totalDeposited)}`} />
        <StatCard icon={<ReleasedIcon />} label="Released" value={`$${formatUSDC(stats.totalReleased)}`} />
        <StatCard icon={<MsCountIcon />} label="Milestones" value={`${completed}/${total}`} sub={`${Number(stats.pendingMilestones)} pending`} />
      </div>

      {/* Progress */}
      <div className="glass-panel p-5 mb-8">
        <ProgressBar completed={completed} total={total} />
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 mb-6 bg-vault-panel rounded-xl p-1 w-fit">
        {['milestones', 'transactions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg font-display text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-arc-600/20 text-arc-400'
                : 'text-vault-muted hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'milestones' ? (
        milestones.length === 0 ? (
          <EmptyState
            icon={<EmptyMsIcon />}
            title="No Milestones"
            description="Add milestones to define payment release stages for this vault."
          />
        ) : (
          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <MilestoneCard
                key={idx}
                milestone={m}
                isOwner={isOwner}
                txLoading={txLoading}
                onAction={handleAction}
              />
            ))}
          </div>
        )
      ) : (
        transactions.length === 0 ? (
          <EmptyState icon={<EmptyTxIcon />} title="No Transactions" description="Transactions will appear here as you interact with this vault." />
        ) : (
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-vault-border/50">
                    <th className="text-left px-5 py-3 text-xs font-display uppercase tracking-wider text-vault-muted">Time</th>
                    <th className="text-left px-5 py-3 text-xs font-display uppercase tracking-wider text-vault-muted">Action</th>
                    <th className="text-right px-5 py-3 text-xs font-display uppercase tracking-wider text-vault-muted">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-display uppercase tracking-wider text-vault-muted">Actor</th>
                  </tr>
                </thead>
                <tbody>
                  {[...transactions].reverse().map((tx, idx) => (
                    <tr key={idx} className="border-b border-vault-border/20 hover:bg-vault-surface/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-vault-muted">{formatDateTime(tx.timestamp)}</td>
                      <td className="px-5 py-3 font-display text-sm text-white font-medium">{tx.action}</td>
                      <td className="px-5 py-3 font-mono text-sm text-right text-arc-400">${formatUSDC(tx.amount)}</td>
                      <td className="px-5 py-3 font-mono text-xs text-vault-muted">{shortenAddress(tx.actor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ─── Milestone Card ─────────────────────────────────────────
function MilestoneCard({ milestone, isOwner, txLoading, onAction }) {
  const m = milestone;
  const status = Number(m.status);
  const expired = isExpired(m.deadline);

  return (
    <div className="glass-panel p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-display font-bold text-white">#{Number(m.id)} — {m.title}</h4>
            <StatusBadge status={status} />
          </div>
          {m.description && <p className="text-sm text-vault-muted leading-relaxed">{m.description}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="font-display font-bold text-lg text-white">${formatUSDC(m.amount)}</p>
          <p className={`text-xs font-mono ${expired && status < 4 ? 'text-red-400' : 'text-vault-muted'}`}>
            {expired && status < 4 ? 'Deadline passed' : timeRemaining(m.deadline)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-vault-border/30">
        <span className="text-[11px] font-mono text-vault-muted">Deadline: {formatDate(m.deadline)}</span>
        <span className="text-[11px] font-mono text-vault-muted">Created: {formatDate(m.createdAt)}</span>
        <div className="flex-1" />

        {/* Actions */}
        {status === 0 && ( // Pending → can submit
          <button onClick={() => onAction('submit', Number(m.id))} disabled={txLoading} className="btn-primary text-xs py-1.5 px-3">
            Submit for Review
          </button>
        )}
        {status === 1 && isOwner && ( // Submitted → owner can approve/reject
          <>
            <button onClick={() => onAction('approve', Number(m.id))} disabled={txLoading} className="btn-primary text-xs py-1.5 px-3">
              Approve
            </button>
            <button onClick={() => onAction('reject', Number(m.id))} disabled={txLoading} className="btn-danger text-xs py-1.5 px-3">
              Reject
            </button>
          </>
        )}
        {status === 2 && isOwner && ( // Approved → owner can release
          <button onClick={() => onAction('release', Number(m.id))} disabled={txLoading} className="btn-primary text-xs py-1.5 px-3">
            Release Payment
          </button>
        )}
        {status === 3 && ( // Rejected → can resubmit
          <button onClick={() => onAction('submit', Number(m.id))} disabled={txLoading} className="btn-secondary text-xs py-1.5 px-3">
            Resubmit
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Icons ──────────────────────────────────────────────────
function LockedIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
}
function DepositedIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 7l-5-5-5 5" /></svg>;
}
function ReleasedIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22V2M7 17l5 5 5-5" /></svg>;
}
function MsCountIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
}
function ErrorIcon() {
  return <svg className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
}
function EmptyMsIcon() {
  return <svg className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>;
}
function EmptyTxIcon() {
  return <svg className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
}

function MintUSDCButton() {
  const { signer } = useWeb3();
  const [minting, setMinting] = useState(false);

  const handleMint = async () => {
    if (!signer) return;
    setMinting(true);
    try {
      const { CONTRACTS } = await import('../utils/constants');
      const usdc = new (await import('ethers')).Contract(
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
