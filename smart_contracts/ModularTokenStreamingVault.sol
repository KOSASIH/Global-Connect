// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title ModularTokenStreamingVault
/// @notice Unstoppable, modular, programmable token streaming for DAOs, payroll, grants, vesting, and recurring payments. Plugin-ready for cliffs, pausing, unlocks. ERC20/native, DAO/protocol ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IStreamPlugin {
    function onWithdraw(uint256 streamId, address recipient, uint256 amount) external returns (bool);
    function canWithdraw(uint256 streamId, address recipient, uint256 amount) external view returns (bool);
}

contract ModularTokenStreamingVault is Ownable {
    enum StreamStatus { Active, Paused, Cancelled, Completed }

    struct Stream {
        address creator;
        address recipient;
        IERC20 token; // address(0) = native
        uint256 totalAmount;
        uint256 start;
        uint256 stop;
        uint256 withdrawn;
        StreamStatus status;
        address plugin;
        uint256 createdAt;
    }

    uint256 public streamCount;
    mapping(uint256 => Stream) public streams;

    event StreamCreated(uint256 indexed streamId, address indexed creator, address indexed recipient, address token, uint256 totalAmount, uint256 start, uint256 stop, address plugin);
    event StreamWithdrawn(uint256 indexed streamId, address indexed recipient, uint256 amount, uint256 withdrawnTotal);
    event StreamPaused(uint256 indexed streamId);
    event StreamUnpaused(uint256 indexed streamId);
    event StreamCancelled(uint256 indexed streamId, uint256 refunded, uint256 paidOut);
    event StreamCompleted(uint256 indexed streamId);

    // --- Create Stream ---

    function createStream(
        address recipient,
        address token,
        uint256 totalAmount,
        uint256 start,
        uint256 stop,
        address plugin
    ) external payable returns (uint256 streamId) {
        require(recipient != address(0), "No recipient");
        require(totalAmount > 0, "Zero amount");
        require(stop > start && start >= block.timestamp, "Invalid time");
        streamId = streamCount++;
        Stream storage s = streams[streamId];
        s.creator = msg.sender;
        s.recipient = recipient;
        s.token = IERC20(token);
        s.totalAmount = totalAmount;
        s.start = start;
        s.stop = stop;
        s.status = StreamStatus.Active;
        s.plugin = plugin;
        s.createdAt = block.timestamp;

        if (address(s.token) == address(0)) {
            require(msg.value == totalAmount, "ETH mismatch");
        } else {
            require(msg.value == 0, "No ETH for ERC20");
            require(s.token.transferFrom(msg.sender, address(this), totalAmount), "ERC20 transfer failed");
        }

        emit StreamCreated(streamId, msg.sender, recipient, token, totalAmount, start, stop, plugin);
    }

    // --- Withdraw ---

    function withdraw(uint256 streamId, uint256 amount) external {
        Stream storage s = streams[streamId];
        require(msg.sender == s.recipient, "Not recipient");
        require(s.status == StreamStatus.Active, "Not active");
        uint256 available = withdrawableAmount(streamId);
        require(amount <= available, "Too much");

        if (s.plugin != address(0)) {
            require(IStreamPlugin(s.plugin).canWithdraw(streamId, msg.sender, amount), "Plugin blocked");
            require(IStreamPlugin(s.plugin).onWithdraw(streamId, msg.sender, amount), "Plugin fail");
        }

        s.withdrawn += amount;
        if (address(s.token) == address(0)) {
            payable(s.recipient).transfer(amount);
        } else {
            s.token.transfer(s.recipient, amount);
        }
        emit StreamWithdrawn(streamId, s.recipient, amount, s.withdrawn);

        if (s.withdrawn >= s.totalAmount) {
            s.status = StreamStatus.Completed;
            emit StreamCompleted(streamId);
        }
    }

    // --- Pause/Unpause (DAO/governance) ---

    function pauseStream(uint256 streamId) external onlyOwner {
        Stream storage s = streams[streamId];
        require(s.status == StreamStatus.Active, "Not active");
        s.status = StreamStatus.Paused;
        emit StreamPaused(streamId);
    }

    function unpauseStream(uint256 streamId) external onlyOwner {
        Stream storage s = streams[streamId];
        require(s.status == StreamStatus.Paused, "Not paused");
        s.status = StreamStatus.Active;
        emit StreamUnpaused(streamId);
    }

    // --- Cancel Stream (DAO/governance) ---

    function cancelStream(uint256 streamId) external onlyOwner {
        Stream storage s = streams[streamId];
        require(s.status == StreamStatus.Active || s.status == StreamStatus.Paused, "Not cancellable");
        uint256 refund = s.totalAmount - s.withdrawn;
        s.status = StreamStatus.Cancelled;
        if (refund > 0) {
            if (address(s.token) == address(0)) {
                payable(s.creator).transfer(refund);
            } else {
                s.token.transfer(s.creator, refund);
            }
        }
        emit StreamCancelled(streamId, refund, s.withdrawn);
    }

    // --- View Functions ---

    function withdrawableAmount(uint256 streamId) public view returns (uint256) {
        Stream storage s = streams[streamId];
        if (block.timestamp < s.start) return 0;
        if (block.timestamp >= s.stop) return s.totalAmount - s.withdrawn;
        uint256 elapsed = block.timestamp - s.start;
        uint256 duration = s.stop - s.start;
        uint256 earned = (s.totalAmount * elapsed) / duration;
        if (earned < s.withdrawn) return 0;
        return earned - s.withdrawn;
    }

    function getStream(uint256 streamId) external view returns (
        address creator,
        address recipient,
        address token,
        uint256 totalAmount,
        uint256 start,
        uint256 stop,
        uint256 withdrawn,
        StreamStatus status,
        address plugin,
        uint256 createdAt
    ) {
        Stream storage s = streams[streamId];
        return (
            s.creator,
            s.recipient,
            address(s.token),
            s.totalAmount,
            s.start,
            s.stop,
            s.withdrawn,
            s.status,
            s.plugin,
            s.createdAt
        );
    }
}
