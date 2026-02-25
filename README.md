# ARC Milestone Vault

A decentralized goal-based treasury protocol built on **Arc Testnet**. Users can create funding vaults and define milestone-based payment releases — funds stay locked until milestones are approved.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React + Vite)               │
│   Dashboard  ·  Create Vault  ·  Vault Detail + Milestones  │
├─────────────────────────────────────────────────────────────┤
│                     Ethers.js v6                            │
├──────────────────┬──────────────────┬───────────────────────┤
│   VaultFactory   │  MilestoneVault  │      MockUSDC         │
│   (deployer)     │  (per-vault)     │   (test token)        │
├──────────────────┴──────────────────┴───────────────────────┤
│                    Arc Testnet (EVM)                         │
└─────────────────────────────────────────────────────────────┘
```

## Deploy on Vercel (Zero Config)

### Step 1 — Push to GitHub

Upload this entire project as a GitHub repository.

### Step 2 — Import on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Vercel auto-detects Vite — no settings to change
4. Add these **Environment Variables** in Vercel dashboard:

| Variable | Value |
|---|---|
| `VITE_FACTORY_ADDRESS` | Your deployed VaultFactory contract address |
| `VITE_USDC_ADDRESS` | Your deployed MockUSDC contract address |
| `VITE_CHAIN_ID` | `1114` (or your Arc Testnet chain ID) |
| `VITE_RPC_URL` | `https://testnet-rpc.arc.xyz` |
| `VITE_EXPLORER_URL` | `https://testnet.arcscan.io` |

5. Click **Deploy** — done!

> **Note:** If you haven't deployed contracts yet, the app will still build and run — it will just show the wallet connect screen. Deploy contracts later using Remix and update the env vars.

### Deploying Contracts (via Remix — easiest)

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create the 3 contract files from the `contracts/` folder
3. Install OpenZeppelin: In Remix, it auto-resolves `@openzeppelin` imports
4. Compile with Solidity `0.8.20`
5. Connect MetaMask to Arc Testnet
6. Deploy in this order:
   - **MockUSDC** → copy its address
   - **VaultFactory**(MockUSDC_address) → copy its address
7. Paste both addresses into Vercel env vars → **Redeploy**

## Smart Contracts

### VaultFactory.sol
- Deploys new `MilestoneVault` contracts
- Tracks all vaults per user address
- Stores vault metadata (name, owner, creation time)

### MilestoneVault.sol
- Receives USDC deposits (locked in contract)
- Owner defines milestones with title, description, amount, and deadline
- Milestone lifecycle: `Pending → Submitted → Approved → Paid`
- ReentrancyGuard protected
- Full on-chain transaction history

### MockUSDC.sol
- ERC-20 token (6 decimals) for testnet use
- Public `faucet()` function mints 10,000 USDC to caller

## Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Contracts   | Solidity ^0.8.20, OpenZeppelin |
| Frontend    | React 18, Vite 5               |
| Styling     | Tailwind CSS 3                 |
| Web3        | Ethers.js v6                   |
| Hosting     | Vercel                         |
| Network     | Arc Testnet                    |

## Project Structure

```
arc-milestone-vault/
├── contracts/
│   ├── MilestoneVault.sol       # Core vault with milestone logic
│   ├── VaultFactory.sol         # Factory to deploy & track vaults
│   └── MockUSDC.sol             # Test USDC token
├── src/
│   ├── abi/                     # ABIs & deployed addresses
│   ├── components/              # Navbar, ConnectPrompt, UI kit
│   ├── context/                 # Web3Context (wallet + provider)
│   ├── hooks/                   # useVault hook (contract calls)
│   ├── pages/                   # Dashboard, CreateVault, VaultDetail
│   ├── utils/                   # Constants, helpers
│   ├── App.jsx                  # Router & layout
│   ├── main.jsx                 # Entry point
│   └── index.css                # Tailwind + custom styles
├── vercel.json                  # Vercel SPA config
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## Features

- MetaMask wallet connection with auto chain switching
- Real-time vault analytics dashboard
- Milestone progress tracking with visual progress bars
- Status badges (Pending / Submitted / Approved / Rejected / Paid)
- On-chain transaction history table
- Toast notifications for all transactions
- Responsive glass-morphism dark UI
- Auto-reconnect on page refresh

## Usage Flow

1. **Connect Wallet** — MetaMask auto-prompts to add Arc Testnet
2. **Mint Test USDC** — Call `faucet()` on MockUSDC contract
3. **Create Vault** — Deploy a new MilestoneVault via the factory
4. **Deposit Funds** — Approve & deposit USDC into the vault
5. **Add Milestones** — Define goals with amounts and deadlines
6. **Submit → Approve → Release** — Complete the milestone lifecycle

## Security

- **ReentrancyGuard** on all state-changing functions
- **SafeERC20** for token transfers
- **Owner-only** access control for approvals and payments
- Funds locked in contract until explicit release
- Input validation on all parameters

## Local Development (Optional)

```bash
npm install
npm run dev
```

## License

MIT
