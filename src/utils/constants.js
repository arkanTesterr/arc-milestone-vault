import deployedAddresses from '../abi/deployed-addresses.json';

// ─── Arc Testnet Network Config ──────────────────────────────
export const ARC_TESTNET = {
  chainId:    import.meta.env.VITE_CHAIN_ID || '5042002',
  chainIdHex: '0x' + Number(import.meta.env.VITE_CHAIN_ID || 5042002).toString(16),
  chainName:  'Arc Network Testnet',
  rpcUrl:     import.meta.env.VITE_RPC_URL || 'https://rpc.testnet.arc.network',
  explorer:   import.meta.env.VITE_EXPLORER_URL || 'https://testnet.arcscan.io',
  currency: {
    name:     'USDC',
    symbol:   'USDC',
    decimals: 18,
  },
};

// ─── Contract Addresses (Vercel env vars override JSON) ──────
const factoryAddr = import.meta.env.VITE_FACTORY_ADDRESS || deployedAddresses.VaultFactory;
const usdcAddr    = import.meta.env.VITE_USDC_ADDRESS    || deployedAddresses.MockUSDC;

export const CONTRACTS = {
  FACTORY: factoryAddr,
  USDC:    usdcAddr,
};

// Check if contracts are actually deployed (not placeholder)
export const CONTRACTS_DEPLOYED = 
  factoryAddr && !factoryAddr.includes('REPLACE') &&
  usdcAddr    && !usdcAddr.includes('REPLACE');

// ─── USDC Config ─────────────────────────────────────────────
export const USDC_DECIMALS = 6;

// ─── Milestone Statuses ──────────────────────────────────────
export const MILESTONE_STATUS = {
  0: { label: 'Pending',   key: 'pending',   color: 'status-pending',   bg: 'bg-amber-500/15',  text: 'text-amber-400',  border: 'border-amber-500/30' },
  1: { label: 'Submitted', key: 'submitted', color: 'status-submitted', bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/30' },
  2: { label: 'Approved',  key: 'approved',  color: 'status-approved',  bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  3: { label: 'Rejected',  key: 'rejected',  color: 'status-rejected',  bg: 'bg-red-500/15',    text: 'text-red-400',    border: 'border-red-500/30' },
  4: { label: 'Paid',      key: 'paid',      color: 'status-paid',      bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30' },
};

// ─── Status dot colors (for SVG circles) ─────────────────────
export const STATUS_DOT_COLORS = {
  0: '#f59e0b',
  1: '#3b82f6',
  2: '#10b981',
  3: '#ef4444',
  4: '#8b5cf6',
};
