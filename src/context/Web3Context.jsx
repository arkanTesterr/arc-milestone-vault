import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { ARC_TESTNET, CONTRACTS } from '../utils/constants';
import VaultFactoryABI from '../abi/VaultFactory.json';
import MockUSDCABI from '../abi/MockUSDC.json';

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const isCorrectChain = chainId === Number(ARC_TESTNET.chainId);

  // ─── Switch to Arc Testnet ────────────────────────────────
  const switchChain = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_TESTNET.chainIdHex }],
      });
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: ARC_TESTNET.chainIdHex,
            chainName: ARC_TESTNET.chainName,
            rpcUrls: [ARC_TESTNET.rpcUrl],
            blockExplorerUrls: [ARC_TESTNET.explorer],
            nativeCurrency: ARC_TESTNET.currency,
          }],
        });
      }
    }
  }, []);

  // ─── Connect Wallet ───────────────────────────────────────
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install it to continue.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const walletSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setAccount(accounts[0]);
      setProvider(browserProvider);
      setSigner(walletSigner);
      setChainId(Number(network.chainId));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // ─── Disconnect ───────────────────────────────────────────
  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
  }, []);

  // ─── Contract Getters ─────────────────────────────────────
  const getFactoryContract = useCallback(() => {
    if (!signer) return null;
    return new ethers.Contract(CONTRACTS.FACTORY, VaultFactoryABI, signer);
  }, [signer]);

  const getUSDCContract = useCallback(() => {
    if (!signer) return null;
    return new ethers.Contract(CONTRACTS.USDC, MockUSDCABI, signer);
  }, [signer]);

  const getFactoryReadOnly = useCallback(() => {
    if (!provider) return null;
    return new ethers.Contract(CONTRACTS.FACTORY, VaultFactoryABI, provider);
  }, [provider]);

  // ─── Listen for account / chain changes ───────────────────
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
        // Refresh signer
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        browserProvider.getSigner().then(setSigner);
      }
    };

    const handleChainChanged = (newChainId) => {
      setChainId(Number(newChainId));
      // Refresh provider & signer
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
      browserProvider.getSigner().then(setSigner);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);

  // ─── Auto-reconnect ──────────────────────────────────────
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
        if (accounts.length > 0) connectWallet();
      });
    }
  }, [connectWallet]);

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    isCorrectChain,
    error,
    connectWallet,
    disconnect,
    switchChain,
    getFactoryContract,
    getUSDCContract,
    getFactoryReadOnly,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used within Web3Provider');
  return ctx;
}
