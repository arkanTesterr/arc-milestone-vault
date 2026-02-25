import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import ConnectPrompt from '../components/ConnectPrompt';
import { parseError } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function CreateVault() {
  const { account, isCorrectChain, getFactoryContract } = useWeb3();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  if (!account || !isCorrectChain) return <ConnectPrompt />;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a vault name.');
      return;
    }

    const factory = getFactoryContract();
    if (!factory) return;

    setCreating(true);
    try {
      toast.loading('Creating vault…', { id: 'create' });
      const tx = await factory.createVault(name.trim());
      const receipt = await tx.wait();

      // Extract vault address from VaultCreated event
      const event = receipt.logs.find((log) => {
        try {
          return factory.interface.parseLog(log)?.name === 'VaultCreated';
        } catch {
          return false;
        }
      });

      let vaultAddr;
      if (event) {
        const parsed = factory.interface.parseLog(event);
        vaultAddr = parsed.args.vaultAddress;
      }

      toast.success('Vault created successfully!', { id: 'create' });

      if (vaultAddr) {
        navigate(`/vault/${vaultAddr}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(parseError(err), { id: 'create' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl text-white mb-1">Create New Vault</h1>
        <p className="text-vault-muted text-sm">Deploy a new milestone-based funding vault on Arc Testnet.</p>
      </div>

      <div className="glass-panel p-8">
        {/* Visual header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-vault-border/50">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-arc-500/20 to-violet-500/20 border border-arc-500/30 flex items-center justify-center shrink-0">
            <svg className="h-7 w-7 text-arc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20V10l8-6 8 6v10H4z" />
              <line x1="12" y1="12" x2="12" y2="16" />
              <line x1="10" y1="14" x2="14" y2="14" />
            </svg>
          </div>
          <div>
            <h3 className="font-display font-bold text-white">New MilestoneVault Contract</h3>
            <p className="text-xs text-vault-muted">This will deploy a new smart contract with you as owner.</p>
          </div>
        </div>

        <form onSubmit={handleCreate}>
          <div className="mb-6">
            <label className="block text-sm font-display font-medium text-vault-muted mb-2">Vault Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q1 Product Development Fund"
              className="input-field text-lg"
              maxLength={100}
              disabled={creating}
            />
            <p className="text-xs text-vault-muted mt-1.5">A descriptive name for this treasury vault.</p>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <InfoCard
              icon="🔐"
              title="Secure Funds"
              desc="USDC is locked in the smart contract until milestones are approved."
            />
            <InfoCard
              icon="📋"
              title="Milestone Tracking"
              desc="Define milestones with deadlines, amounts, and approval workflow."
            />
            <InfoCard
              icon="✅"
              title="Owner Control"
              desc="Only you can approve milestones and release payments."
            />
            <InfoCard
              icon="📊"
              title="Full Transparency"
              desc="All transactions are recorded on-chain and visible in the dashboard."
            />
          </div>

          <button type="submit" disabled={creating || !name.trim()} className="btn-primary w-full py-3 text-base">
            {creating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Deploying Contract…
              </span>
            ) : (
              'Deploy Vault Contract'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }) {
  return (
    <div className="bg-vault-dark/60 rounded-xl p-3.5 border border-vault-border/30">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span className="font-display font-semibold text-sm text-white">{title}</span>
      </div>
      <p className="text-xs text-vault-muted leading-relaxed">{desc}</p>
    </div>
  );
}
