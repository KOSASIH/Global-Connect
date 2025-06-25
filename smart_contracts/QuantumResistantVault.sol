// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title QuantumResistantVault
/// @notice Ultra-secure vault with upgradeable post-quantum signature verification, multi-tier access, and circuit breaker.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

interface IPQSignatureVerifier {
    function verify(
        bytes calldata message,
        bytes calldata signature,
        address signer
    ) external view returns (bool);
}

contract QuantumResistantVault {
    address public owner;
    mapping(address => bool) public guardians;
    IPQSignatureVerifier public pqVerifier;
    bool public paused;

    // Nonce tracking for replay protection
    mapping(address => uint256) public nonces;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, address to);
    event PQVerifierChanged(address indexed newVerifier);
    event GuardianAdded(address indexed guardian);
    event GuardianRemoved(address indexed guardian);
    event Paused(address indexed by);
    event Unpaused(address indexed by);
    event EmergencyWithdrawal(address indexed by, address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyGuardianOrOwner() {
        require(msg.sender == owner || guardians[msg.sender], "Not guardian/owner");
        _;
    }

    modifier notPaused() {
        require(!paused, "Vault is paused");
        _;
    }

    constructor(address _pqVerifier) {
        require(_pqVerifier != address(0), "Invalid verifier");
        owner = msg.sender;
        pqVerifier = IPQSignatureVerifier(_pqVerifier);
    }

    // --- PQ Verifier Management ---

    function setPQVerifier(address _pqVerifier) external onlyOwner {
        require(_pqVerifier != address(0), "Invalid verifier");
        pqVerifier = IPQSignatureVerifier(_pqVerifier);
        emit PQVerifierChanged(_pqVerifier);
    }

    // --- Guardian Management ---

    function addGuardian(address guardian) external onlyOwner {
        require(guardian != address(0), "Invalid guardian");
        guardians[guardian] = true;
        emit GuardianAdded(guardian);
    }

    function removeGuardian(address guardian) external onlyOwner {
        require(guardians[guardian], "Not a guardian");
        guardians[guardian] = false;
        emit GuardianRemoved(guardian);
    }

    // --- Pause/Unpause ---

    function pause() external onlyGuardianOrOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    // --- Deposits ---

    function deposit() external payable notPaused {
        require(msg.value > 0, "Zero deposit");
        emit Deposited(msg.sender, msg.value);
    }

    // --- Withdrawals (Post-Quantum Auth) ---

    /// @notice Withdraw funds with quantum-safe signature verification
    /// @param to Address to receive the funds
    /// @param amount Amount to withdraw in wei
    /// @param signature Post-quantum signature over (msg.sender, to, amount, address(this), nonce)
    function withdraw(
        address to,
        uint256 amount,
        bytes calldata signature
    ) external notPaused {
        require(to != address(0), "Invalid recipient");
        require(address(this).balance >= amount, "Insufficient balance");
        uint256 nonce = nonces[msg.sender];
        bytes memory message = abi.encodePacked(msg.sender, to, amount, address(this), nonce);
        require(pqVerifier.verify(message, signature, msg.sender), "Invalid PQ signature");
        nonces[msg.sender]++;
        payable(to).transfer(amount);
        emit Withdrawn(msg.sender, amount, to);
    }

    // --- Circuit Breaker Emergency Withdraw ---

    /// @notice Emergency withdrawal by owner or guardian, only when paused.
    function emergencyWithdraw(address to, uint256 amount) external onlyGuardianOrOwner {
        require(paused, "Not paused");
        require(to != address(0), "Invalid address");
        require(address(this).balance >= amount, "Insufficient balance");
        payable(to).transfer(amount);
        emit EmergencyWithdrawal(msg.sender, to, amount);
    }

    // --- Fallback for Native Payments ---
    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }
}
