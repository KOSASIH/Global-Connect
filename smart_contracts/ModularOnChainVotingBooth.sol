// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title ModularOnChainVotingBooth
/// @notice Modular, unstoppable, plugin-based on-chain voting system for DAOs, protocols, communities. Supports ERC20/ERC721/SBT/quadratic/weighted, custom eligibility, and tally plugins. DAO/governance/DeFi ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IVoteWeightPlugin {
    function getWeight(address voter, uint256 sessionId, bytes calldata data) external view returns (uint256);
}

interface IEligibilityPlugin {
    function isEligible(address voter, uint256 sessionId, bytes calldata data) external view returns (bool);
}

interface ITallyPlugin {
    function tally(uint256 sessionId, bytes calldata data) external returns (uint256[] memory results);
}

contract ModularOnChainVotingBooth is Ownable {
    enum VotingStatus { Pending, Active, Ended, Cancelled }

    struct Option {
        string description;
        uint256 voteCount;
    }

    struct VotingSession {
        string title;
        string metadataURI;
        VotingStatus status;
        uint256 start;
        uint256 end;
        Option[] options;
        mapping(address => bool) hasVoted;
        address voteWeightPlugin;
        address eligibilityPlugin;
        address tallyPlugin;
        uint256 createdAt;
        uint256 endedAt;
        uint256 snapshotBlock;
    }

    uint256 public sessionCount;
    mapping(uint256 => VotingSession) public sessions;

    event VotingSessionCreated(
        uint256 indexed sessionId,
        string title,
        string metadataURI,
        address voteWeightPlugin,
        address eligibilityPlugin,
        address tallyPlugin,
        uint256 start,
        uint256 end
    );
    event VoteCast(uint256 indexed sessionId, address indexed voter, uint256 option, uint256 weight);
    event VotingSessionStatusChanged(uint256 indexed sessionId, VotingStatus status);
    event VotingTallied(uint256 indexed sessionId, uint256[] results);

    // --- Create Voting Session ---

    function createVotingSession(
        string calldata title,
        string calldata metadataURI,
        string[] calldata optionDescriptions,
        uint256 start,
        uint256 end,
        address voteWeightPlugin,
        address eligibilityPlugin,
        address tallyPlugin
    ) external onlyOwner returns (uint256 sessionId) {
        require(bytes(title).length > 0, "No title");
        require(optionDescriptions.length >= 2, "At least 2 options");
        require(end > start && start >= block.timestamp, "Invalid time");
        sessionId = sessionCount++;
        VotingSession storage vs = sessions[sessionId];
        vs.title = title;
        vs.metadataURI = metadataURI;
        vs.status = VotingStatus.Pending;
        vs.start = start;
        vs.end = end;
        vs.voteWeightPlugin = voteWeightPlugin;
        vs.eligibilityPlugin = eligibilityPlugin;
        vs.tallyPlugin = tallyPlugin;
        vs.createdAt = block.timestamp;
        vs.snapshotBlock = block.number;
        for (uint256 i = 0; i < optionDescriptions.length; i++) {
            vs.options.push(Option({
                description: optionDescriptions[i],
                voteCount: 0
            }));
        }
        emit VotingSessionCreated(sessionId, title, metadataURI, voteWeightPlugin, eligibilityPlugin, tallyPlugin, start, end);
        emit VotingSessionStatusChanged(sessionId, VotingStatus.Pending);
    }

    function activateVotingSession(uint256 sessionId) external onlyOwner {
        VotingSession storage vs = sessions[sessionId];
        require(vs.status == VotingStatus.Pending, "Not pending");
        require(block.timestamp >= vs.start, "Not started yet");
        vs.status = VotingStatus.Active;
        emit VotingSessionStatusChanged(sessionId, VotingStatus.Active);
    }

    function endVotingSession(uint256 sessionId) external onlyOwner {
        VotingSession storage vs = sessions[sessionId];
        require(vs.status == VotingStatus.Active, "Not active");
        require(block.timestamp >= vs.end, "Not ended");
        vs.status = VotingStatus.Ended;
        vs.endedAt = block.timestamp;
        emit VotingSessionStatusChanged(sessionId, VotingStatus.Ended);
    }

    function cancelVotingSession(uint256 sessionId) external onlyOwner {
        VotingSession storage vs = sessions[sessionId];
        vs.status = VotingStatus.Cancelled;
        emit VotingSessionStatusChanged(sessionId, VotingStatus.Cancelled);
    }

    // --- Voting ---

    function vote(uint256 sessionId, uint256 option, bytes calldata eligibilityData, bytes calldata weightData) external {
        VotingSession storage vs = sessions[sessionId];
        require(vs.status == VotingStatus.Active, "Not active");
        require(block.timestamp >= vs.start && block.timestamp <= vs.end, "Not open");
        require(!vs.hasVoted[msg.sender], "Already voted");
        require(option < vs.options.length, "Invalid option");

        if (vs.eligibilityPlugin != address(0)) {
            require(IEligibilityPlugin(vs.eligibilityPlugin).isEligible(msg.sender, sessionId, eligibilityData), "Not eligible");
        }

        uint256 weight = 1;
        if (vs.voteWeightPlugin != address(0)) {
            weight = IVoteWeightPlugin(vs.voteWeightPlugin).getWeight(msg.sender, sessionId, weightData);
            require(weight > 0, "Zero weight");
        }

        vs.options[option].voteCount += weight;
        vs.hasVoted[msg.sender] = true;
        emit VoteCast(sessionId, msg.sender, option, weight);
    }

    // --- Tally ---

    function tally(uint256 sessionId, bytes calldata tallyData) external onlyOwner returns (uint256[] memory results) {
        VotingSession storage vs = sessions[sessionId];
        require(vs.status == VotingStatus.Ended, "Not ended");
        if (vs.tallyPlugin != address(0)) {
            results = ITallyPlugin(vs.tallyPlugin).tally(sessionId, tallyData);
        } else {
            results = new uint256[](vs.options.length);
            for (uint256 i = 0; i < vs.options.length; i++) {
                results[i] = vs.options[i].voteCount;
            }
        }
        emit VotingTallied(sessionId, results);
    }

    // --- View Functions ---

    function getSession(uint256 sessionId) external view returns (
        string memory title,
        string memory metadataURI,
        VotingStatus status,
        uint256 start,
        uint256 end,
        uint256 optionCount,
        address voteWeightPlugin,
        address eligibilityPlugin,
        address tallyPlugin,
        uint256 createdAt,
        uint256 endedAt,
        uint256 snapshotBlock
    ) {
        VotingSession storage vs = sessions[sessionId];
        return (
            vs.title,
            vs.metadataURI,
            vs.status,
            vs.start,
            vs.end,
            vs.options.length,
            vs.voteWeightPlugin,
            vs.eligibilityPlugin,
            vs.tallyPlugin,
            vs.createdAt,
            vs.endedAt,
            vs.snapshotBlock
        );
    }

    function getOption(uint256 sessionId, uint256 optionId) external view returns (string memory description, uint256 voteCount) {
        Option storage o = sessions[sessionId].options[optionId];
        return (o.description, o.voteCount);
    }

    function hasVoted(uint256 sessionId, address voter) external view returns (bool) {
        return sessions[sessionId].hasVoted[voter];
    }
}
