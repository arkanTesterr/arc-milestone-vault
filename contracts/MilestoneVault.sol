// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MilestoneVault
 * @notice A goal-based treasury vault with milestone-driven payment releases.
 * @dev Each vault is owned by a single address that controls milestone approval.
 *      Funds (USDC) are locked in the contract and released only after milestone approval.
 */
contract MilestoneVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Enums ────────────────────────────────────────────────────────────────
    enum MilestoneStatus {
        Pending,
        Submitted,
        Approved,
        Rejected,
        Paid
    }

    // ─── Structs ──────────────────────────────────────────────────────────────
    struct Milestone {
        uint256 id;
        string title;
        string description;
        uint256 amount;
        uint256 deadline;
        MilestoneStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct VaultStats {
        uint256 totalDeposited;
        uint256 totalReleased;
        uint256 totalLocked;
        uint256 milestoneCount;
        uint256 completedMilestones;
        uint256 pendingMilestones;
    }

    struct TransactionRecord {
        uint256 timestamp;
        string action;
        uint256 amount;
        uint256 milestoneId;
        address actor;
    }

    // ─── State ────────────────────────────────────────────────────────────────
    address public owner;
    IERC20 public usdcToken;
    string public vaultName;

    uint256 public totalDeposited;
    uint256 public totalReleased;
    uint256 public milestoneCount;

    mapping(uint256 => Milestone) public milestones;
    TransactionRecord[] public transactions;

    // ─── Events ───────────────────────────────────────────────────────────────
    event FundsDeposited(address indexed depositor, uint256 amount, uint256 timestamp);
    event MilestoneAdded(uint256 indexed milestoneId, string title, uint256 amount, uint256 deadline);
    event MilestoneSubmitted(uint256 indexed milestoneId, uint256 timestamp);
    event MilestoneApproved(uint256 indexed milestoneId, uint256 timestamp);
    event MilestoneRejected(uint256 indexed milestoneId, uint256 timestamp);
    event PaymentReleased(uint256 indexed milestoneId, uint256 amount, uint256 timestamp);

    // ─── Modifiers ────────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "MilestoneVault: caller is not the owner");
        _;
    }

    modifier validMilestone(uint256 _milestoneId) {
        require(_milestoneId < milestoneCount, "MilestoneVault: milestone does not exist");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(address _owner, address _usdcToken, string memory _vaultName) {
        require(_owner != address(0), "MilestoneVault: owner is zero address");
        require(_usdcToken != address(0), "MilestoneVault: token is zero address");
        owner = _owner;
        usdcToken = IERC20(_usdcToken);
        vaultName = _vaultName;
    }

    // ─── Core Functions ───────────────────────────────────────────────────────

    /**
     * @notice Deposit USDC funds into the vault.
     * @param _amount Amount of USDC to deposit (in token decimals).
     */
    function depositFunds(uint256 _amount) external nonReentrant {
        require(_amount > 0, "MilestoneVault: deposit must be > 0");
        usdcToken.safeTransferFrom(msg.sender, address(this), _amount);
        totalDeposited += _amount;

        transactions.push(TransactionRecord({
            timestamp: block.timestamp,
            action: "Deposit",
            amount: _amount,
            milestoneId: 0,
            actor: msg.sender
        }));

        emit FundsDeposited(msg.sender, _amount, block.timestamp);
    }

    /**
     * @notice Add a new milestone to the vault.
     */
    function addMilestone(
        string calldata _title,
        string calldata _description,
        uint256 _amount,
        uint256 _deadline
    ) external onlyOwner {
        require(bytes(_title).length > 0, "MilestoneVault: title required");
        require(_amount > 0, "MilestoneVault: amount must be > 0");
        require(_deadline > block.timestamp, "MilestoneVault: deadline must be in the future");

        uint256 id = milestoneCount;
        milestones[id] = Milestone({
            id: id,
            title: _title,
            description: _description,
            amount: _amount,
            deadline: _deadline,
            status: MilestoneStatus.Pending,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        milestoneCount++;

        transactions.push(TransactionRecord({
            timestamp: block.timestamp,
            action: "Milestone Added",
            amount: _amount,
            milestoneId: id,
            actor: msg.sender
        }));

        emit MilestoneAdded(id, _title, _amount, _deadline);
    }

    /**
     * @notice Submit a milestone for review.
     */
    function submitMilestone(uint256 _milestoneId)
        external
        validMilestone(_milestoneId)
    {
        Milestone storage m = milestones[_milestoneId];
        require(
            m.status == MilestoneStatus.Pending || m.status == MilestoneStatus.Rejected,
            "MilestoneVault: milestone not in submittable state"
        );

        m.status = MilestoneStatus.Submitted;
        m.updatedAt = block.timestamp;

        transactions.push(TransactionRecord({
            timestamp: block.timestamp,
            action: "Milestone Submitted",
            amount: m.amount,
            milestoneId: _milestoneId,
            actor: msg.sender
        }));

        emit MilestoneSubmitted(_milestoneId, block.timestamp);
    }

    /**
     * @notice Approve a submitted milestone. Only owner.
     */
    function approveMilestone(uint256 _milestoneId)
        external
        onlyOwner
        validMilestone(_milestoneId)
    {
        Milestone storage m = milestones[_milestoneId];
        require(m.status == MilestoneStatus.Submitted, "MilestoneVault: not submitted");

        m.status = MilestoneStatus.Approved;
        m.updatedAt = block.timestamp;

        transactions.push(TransactionRecord({
            timestamp: block.timestamp,
            action: "Milestone Approved",
            amount: m.amount,
            milestoneId: _milestoneId,
            actor: msg.sender
        }));

        emit MilestoneApproved(_milestoneId, block.timestamp);
    }

    /**
     * @notice Reject a submitted milestone. Only owner.
     */
    function rejectMilestone(uint256 _milestoneId)
        external
        onlyOwner
        validMilestone(_milestoneId)
    {
        Milestone storage m = milestones[_milestoneId];
        require(m.status == MilestoneStatus.Submitted, "MilestoneVault: not submitted");

        m.status = MilestoneStatus.Rejected;
        m.updatedAt = block.timestamp;

        transactions.push(TransactionRecord({
            timestamp: block.timestamp,
            action: "Milestone Rejected",
            amount: m.amount,
            milestoneId: _milestoneId,
            actor: msg.sender
        }));

        emit MilestoneRejected(_milestoneId, block.timestamp);
    }

    /**
     * @notice Release payment for an approved milestone. Only owner.
     */
    function releasePayment(uint256 _milestoneId)
        external
        onlyOwner
        nonReentrant
        validMilestone(_milestoneId)
    {
        Milestone storage m = milestones[_milestoneId];
        require(m.status == MilestoneStatus.Approved, "MilestoneVault: not approved");

        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance >= m.amount, "MilestoneVault: insufficient vault balance");

        m.status = MilestoneStatus.Paid;
        m.updatedAt = block.timestamp;
        totalReleased += m.amount;

        usdcToken.safeTransfer(owner, m.amount);

        transactions.push(TransactionRecord({
            timestamp: block.timestamp,
            action: "Payment Released",
            amount: m.amount,
            milestoneId: _milestoneId,
            actor: msg.sender
        }));

        emit PaymentReleased(_milestoneId, m.amount, block.timestamp);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    function getMilestones() external view returns (Milestone[] memory) {
        Milestone[] memory result = new Milestone[](milestoneCount);
        for (uint256 i = 0; i < milestoneCount; i++) {
            result[i] = milestones[i];
        }
        return result;
    }

    function getMilestone(uint256 _milestoneId)
        external
        view
        validMilestone(_milestoneId)
        returns (Milestone memory)
    {
        return milestones[_milestoneId];
    }

    function getVaultStats() external view returns (VaultStats memory) {
        uint256 completed = 0;
        uint256 pending = 0;
        for (uint256 i = 0; i < milestoneCount; i++) {
            if (milestones[i].status == MilestoneStatus.Paid) {
                completed++;
            } else if (
                milestones[i].status == MilestoneStatus.Pending ||
                milestones[i].status == MilestoneStatus.Submitted
            ) {
                pending++;
            }
        }

        uint256 balance = usdcToken.balanceOf(address(this));

        return VaultStats({
            totalDeposited: totalDeposited,
            totalReleased: totalReleased,
            totalLocked: balance,
            milestoneCount: milestoneCount,
            completedMilestones: completed,
            pendingMilestones: pending
        });
    }

    function getTransactions() external view returns (TransactionRecord[] memory) {
        return transactions;
    }

    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }
}
