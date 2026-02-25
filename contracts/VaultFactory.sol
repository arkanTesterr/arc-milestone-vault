// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MilestoneVault.sol";

/**
 * @title VaultFactory
 * @notice Factory contract to deploy and track MilestoneVault instances.
 * @dev Stores all vault addresses per user for easy querying.
 */
contract VaultFactory {

    // ─── State ────────────────────────────────────────────────────────────────
    address public usdcToken;
    address[] public allVaults;

    mapping(address => address[]) public userVaults;

    struct VaultInfo {
        address vaultAddress;
        address owner;
        string vaultName;
        uint256 createdAt;
    }

    mapping(address => VaultInfo) public vaultInfo;

    // ─── Events ───────────────────────────────────────────────────────────────
    event VaultCreated(
        address indexed owner,
        address indexed vaultAddress,
        string vaultName,
        uint256 timestamp
    );

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(address _usdcToken) {
        require(_usdcToken != address(0), "VaultFactory: token is zero address");
        usdcToken = _usdcToken;
    }

    // ─── Core Functions ───────────────────────────────────────────────────────

    /**
     * @notice Create a new MilestoneVault.
     * @param _vaultName Human-readable name for the vault.
     * @return vaultAddress The address of the newly deployed vault.
     */
    function createVault(string calldata _vaultName)
        external
        returns (address vaultAddress)
    {
        require(bytes(_vaultName).length > 0, "VaultFactory: name required");

        MilestoneVault vault = new MilestoneVault(msg.sender, usdcToken, _vaultName);
        vaultAddress = address(vault);

        allVaults.push(vaultAddress);
        userVaults[msg.sender].push(vaultAddress);
        vaultInfo[vaultAddress] = VaultInfo({
            vaultAddress: vaultAddress,
            owner: msg.sender,
            vaultName: _vaultName,
            createdAt: block.timestamp
        });

        emit VaultCreated(msg.sender, vaultAddress, _vaultName, block.timestamp);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    function getUserVaults(address _user) external view returns (address[] memory) {
        return userVaults[_user];
    }

    function getUserVaultCount(address _user) external view returns (uint256) {
        return userVaults[_user].length;
    }

    function getAllVaults() external view returns (address[] memory) {
        return allVaults;
    }

    function getTotalVaultCount() external view returns (uint256) {
        return allVaults.length;
    }

    function getVaultInfo(address _vault) external view returns (VaultInfo memory) {
        return vaultInfo[_vault];
    }
}
