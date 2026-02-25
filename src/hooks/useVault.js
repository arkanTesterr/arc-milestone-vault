import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import MilestoneVaultABI from '../abi/MilestoneVault.json';
import { parseUSDC, parseError } from '../utils/helpers';
import { CONTRACTS } from '../utils/constants';
import toast from 'react-hot-toast';

/**
 * Hook for interacting with a specific MilestoneVault contract.
 */
export function useVault(vaultAddress) {
  const { signer, provider, account } = useWeb3();
  const [loading, setLoading] = useState(false);

  const getVault = useCallback(() => {
    if (!signer || !vaultAddress) return null;
    return new ethers.Contract(vaultAddress, MilestoneVaultABI, signer);
  }, [signer, vaultAddress]);

  const getVaultReadOnly = useCallback(() => {
    if (!provider || !vaultAddress) return null;
    return new ethers.Contract(vaultAddress, MilestoneVaultABI, provider);
  }, [provider, vaultAddress]);

  // ─── Fetch vault data ─────────────────────────────────────
  const fetchVaultData = useCallback(async () => {
    const vault = getVaultReadOnly() || getVault();
    if (!vault) return null;
    try {
      const [name, owner, stats, milestones, transactions] = await Promise.all([
        vault.vaultName(),
        vault.owner(),
        vault.getVaultStats(),
        vault.getMilestones(),
        vault.getTransactions(),
      ]);
      return { name, owner, stats, milestones, transactions };
    } catch (err) {
      console.error('fetchVaultData error:', err);
      return null;
    }
  }, [getVault, getVaultReadOnly]);

  // ─── Deposit ──────────────────────────────────────────────
  const depositFunds = useCallback(async (amount) => {
    const vault = getVault();
    if (!vault || !signer) throw new Error('Not connected');
    setLoading(true);
    try {
      const usdc = new ethers.Contract(CONTRACTS.USDC, [
        'function approve(address,uint256) returns (bool)',
        'function allowance(address,address) view returns (uint256)',
      ], signer);

      const parsedAmount = parseUSDC(amount);
      const currentAllowance = await usdc.allowance(account, vaultAddress);

      if (currentAllowance < parsedAmount) {
        toast.loading('Approving USDC…', { id: 'approve' });
        const approveTx = await usdc.approve(vaultAddress, parsedAmount);
        await approveTx.wait();
        toast.success('USDC approved!', { id: 'approve' });
      }

      toast.loading('Depositing funds…', { id: 'deposit' });
      const tx = await vault.depositFunds(parsedAmount);
      await tx.wait();
      toast.success('Funds deposited!', { id: 'deposit' });
      return tx;
    } catch (err) {
      const msg = parseError(err);
      toast.error(msg, { id: 'deposit' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getVault, signer, account, vaultAddress]);

  // ─── Add Milestone ────────────────────────────────────────
  const addMilestone = useCallback(async (title, description, amount, deadline) => {
    const vault = getVault();
    if (!vault) throw new Error('Not connected');
    setLoading(true);
    try {
      toast.loading('Adding milestone…', { id: 'addMs' });
      const parsedAmount = parseUSDC(amount);
      const deadlineTs = Math.floor(new Date(deadline).getTime() / 1000);
      const tx = await vault.addMilestone(title, description, parsedAmount, deadlineTs);
      await tx.wait();
      toast.success('Milestone added!', { id: 'addMs' });
      return tx;
    } catch (err) {
      toast.error(parseError(err), { id: 'addMs' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getVault]);

  // ─── Submit Milestone ─────────────────────────────────────
  const submitMilestone = useCallback(async (milestoneId) => {
    const vault = getVault();
    if (!vault) throw new Error('Not connected');
    setLoading(true);
    try {
      toast.loading('Submitting milestone…', { id: 'submitMs' });
      const tx = await vault.submitMilestone(milestoneId);
      await tx.wait();
      toast.success('Milestone submitted for review!', { id: 'submitMs' });
      return tx;
    } catch (err) {
      toast.error(parseError(err), { id: 'submitMs' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getVault]);

  // ─── Approve Milestone ────────────────────────────────────
  const approveMilestone = useCallback(async (milestoneId) => {
    const vault = getVault();
    if (!vault) throw new Error('Not connected');
    setLoading(true);
    try {
      toast.loading('Approving milestone…', { id: 'approveMs' });
      const tx = await vault.approveMilestone(milestoneId);
      await tx.wait();
      toast.success('Milestone approved!', { id: 'approveMs' });
      return tx;
    } catch (err) {
      toast.error(parseError(err), { id: 'approveMs' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getVault]);

  // ─── Reject Milestone ─────────────────────────────────────
  const rejectMilestone = useCallback(async (milestoneId) => {
    const vault = getVault();
    if (!vault) throw new Error('Not connected');
    setLoading(true);
    try {
      toast.loading('Rejecting milestone…', { id: 'rejectMs' });
      const tx = await vault.rejectMilestone(milestoneId);
      await tx.wait();
      toast.success('Milestone rejected.', { id: 'rejectMs' });
      return tx;
    } catch (err) {
      toast.error(parseError(err), { id: 'rejectMs' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getVault]);

  // ─── Release Payment ──────────────────────────────────────
  const releasePayment = useCallback(async (milestoneId) => {
    const vault = getVault();
    if (!vault) throw new Error('Not connected');
    setLoading(true);
    try {
      toast.loading('Releasing payment…', { id: 'releasePay' });
      const tx = await vault.releasePayment(milestoneId);
      await tx.wait();
      toast.success('Payment released!', { id: 'releasePay' });
      return tx;
    } catch (err) {
      toast.error(parseError(err), { id: 'releasePay' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getVault]);

  return {
    loading,
    fetchVaultData,
    depositFunds,
    addMilestone,
    submitMilestone,
    approveMilestone,
    rejectMilestone,
    releasePayment,
  };
}
