// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WorldCupPredictorWhitelist
 * @notice Stores whitelisted wallets for the WC Predictor mint.
 *         Only the contract owner (your deployer wallet) can add addresses.
 */
contract WorldCupPredictorWhitelist is Ownable {

    // ── State ──────────────────────────────────────────────
    mapping(address => bool)  private _whitelisted;
    mapping(address => uint256) private _whitelistedAt;
    address[] private _wallets;
    uint256 public  maxSpots;

    // ── Events ─────────────────────────────────────────────
    event Whitelisted(address indexed wallet, uint256 timestamp);
    event RemovedFromWhitelist(address indexed wallet);
    event MaxSpotsUpdated(uint256 newMax);

    // ── Constructor ────────────────────────────────────────
    constructor(uint256 _maxSpots) Ownable(msg.sender) {
        maxSpots = _maxSpots;
    }

    // ── Owner functions ────────────────────────────────────

    /// @notice Add a single wallet to the whitelist
    function addToWhitelist(address wallet) external onlyOwner {
        require(wallet != address(0),  "Zero address");
        require(!_whitelisted[wallet], "Already whitelisted");
        require(_wallets.length < maxSpots, "Whitelist full");

        _whitelisted[wallet]   = true;
        _whitelistedAt[wallet] = block.timestamp;
        _wallets.push(wallet);

        emit Whitelisted(wallet, block.timestamp);
    }

    /// @notice Batch-add wallets (gas-efficient for admin top-ups)
    function batchAddToWhitelist(address[] calldata wallets) external onlyOwner {
        require(_wallets.length + wallets.length <= maxSpots, "Would exceed max spots");
        for (uint256 i = 0; i < wallets.length; i++) {
            address w = wallets[i];
            if (w != address(0) && !_whitelisted[w]) {
                _whitelisted[w]   = true;
                _whitelistedAt[w] = block.timestamp;
                _wallets.push(w);
                emit Whitelisted(w, block.timestamp);
            }
        }
    }

    /// @notice Remove a wallet (admin override)
    function removeFromWhitelist(address wallet) external onlyOwner {
        require(_whitelisted[wallet], "Not whitelisted");
        _whitelisted[wallet] = false;
        emit RemovedFromWhitelist(wallet);
    }

    /// @notice Update maximum spots
    function setMaxSpots(uint256 _maxSpots) external onlyOwner {
        require(_maxSpots >= _wallets.length, "Cannot reduce below current count");
        maxSpots = _maxSpots;
        emit MaxSpotsUpdated(_maxSpots);
    }

    // ── View functions ─────────────────────────────────────

    function isWhitelisted(address wallet) external view returns (bool) {
        return _whitelisted[wallet];
    }

    function whitelistedAt(address wallet) external view returns (uint256) {
        return _whitelistedAt[wallet];
    }

    function totalWhitelisted() external view returns (uint256) {
        return _wallets.length;
    }

    function spotsRemaining() external view returns (uint256) {
        return maxSpots - _wallets.length;
    }

    /// @notice Returns paginated list of whitelisted wallets
    function getWallets(uint256 offset, uint256 limit)
        external view returns (address[] memory)
    {
        uint256 end = offset + limit > _wallets.length
            ? _wallets.length : offset + limit;
        address[] memory page = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) page[i - offset] = _wallets[i];
        return page;
    }
}
