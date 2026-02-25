import { USDC_DECIMALS } from './constants';

/**
 * Format a BigInt USDC amount to a human-readable string.
 */
export function formatUSDC(amount) {
  if (!amount) return '0.00';
  const val = Number(amount) / 10 ** USDC_DECIMALS;
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Parse a human-readable USDC string to BigInt.
 */
export function parseUSDC(amount) {
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) return BigInt(0);
  return BigInt(Math.round(num * 10 ** USDC_DECIMALS));
}

/**
 * Shorten an Ethereum address.
 */
export function shortenAddress(addr, chars = 4) {
  if (!addr) return '';
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

/**
 * Format a Unix timestamp to human-readable date.
 */
export function formatDate(timestamp) {
  if (!timestamp) return '—';
  const ts = Number(timestamp);
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a Unix timestamp with time.
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '—';
  const ts = Number(timestamp);
  return new Date(ts * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if a deadline has passed.
 */
export function isExpired(deadline) {
  return Number(deadline) * 1000 < Date.now();
}

/**
 * Calculate time remaining until a deadline.
 */
export function timeRemaining(deadline) {
  const diff = Number(deadline) * 1000 - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m remaining`;
}

/**
 * Parse a contract error message into a friendly string.
 */
export function parseError(error) {
  const msg = error?.reason || error?.message || String(error);
  // Try to extract revert reason
  const match = msg.match(/reason="([^"]+)"/);
  if (match) return match[1];
  const match2 = msg.match(/MilestoneVault: (.+)/);
  if (match2) return match2[1];
  const match3 = msg.match(/VaultFactory: (.+)/);
  if (match3) return match3[1];
  if (msg.includes('user rejected')) return 'Transaction rejected by user';
  if (msg.includes('insufficient funds')) return 'Insufficient funds for transaction';
  if (msg.length > 120) return msg.slice(0, 120) + '…';
  return msg;
}
