// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    address public owner;
    bool public votingStarted;
    bool public votingEnded;

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint vote;
        bool hasRequested;
    }

    mapping(address => Voter) public voters;
    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;

    address[] public registrationRequests;

    // Events
    event VoterRegistrationRequested(address voter);
    event VoterApproved(address voter);
    event VoterRejected(address voter);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier whenVotingStarted() {
        require(votingStarted && !votingEnded, "Voting is not active");
        _;
    }

    function addCandidate(string memory _name) public onlyOwner {
        require(!votingStarted || votingEnded, "Cannot add candidates while voting is active");
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function requestVoterRegistration() public {
        require(!voters[msg.sender].isRegistered, "Already registered");
        require(!voters[msg.sender].hasRequested, "Already requested");

        voters[msg.sender].hasRequested = true;
        registrationRequests.push(msg.sender);
        emit VoterRegistrationRequested(msg.sender);
    }

    function getRegistrationRequests() public view onlyOwner returns (address[] memory) {
        return registrationRequests;
    }

    function approveVoter(address _voter) public onlyOwner {
        require(voters[_voter].hasRequested, "No registration request from this address");

        voters[_voter].isRegistered = true;
        voters[_voter].hasRequested = false;
        _removeRequest(_voter);

        emit VoterApproved(_voter);
    }

    function rejectVoterRequest(address _voter) public onlyOwner {
        require(voters[_voter].hasRequested, "No registration request from this address");

        voters[_voter].hasRequested = false;
        _removeRequest(_voter);

        emit VoterRejected(_voter);
    }

    function _removeRequest(address _voter) internal {
        for (uint i = 0; i < registrationRequests.length; i++) {
            if (registrationRequests[i] == _voter) {
                registrationRequests[i] = registrationRequests[registrationRequests.length - 1];
                registrationRequests.pop();
                break;
            }
        }
    }

    function startVoting() public onlyOwner {
        // Allow starting voting if it hasn't started yet or if it has ended
        require(!votingStarted || votingEnded, "Voting is already in progress");
        votingStarted = true;
        votingEnded = false;
    }

    function endVoting() public onlyOwner {
        require(votingStarted && !votingEnded, "Voting has not started or already ended");
        votingEnded = true;
    }

    function resetVoting() public onlyOwner {
        require(votingEnded, "Voting has not ended yet");
        
        // Reset voting state
        votingStarted = false;
        votingEnded = false;
        
        // Reset candidates vote counts
        for (uint i = 1; i <= candidatesCount; i++) {
            candidates[i].voteCount = 0;
        }
        
        // Reset voter status
        // Note: This keeps registration but resets voting status
        for (uint i = 0; i < registrationRequests.length; i++) {
            voters[registrationRequests[i]].hasVoted = false;
            voters[registrationRequests[i]].vote = 0;
        }
    }

    function vote(uint _candidateId) public whenVotingStarted {
        Voter storage sender = voters[msg.sender];
        require(sender.isRegistered, "Not a registered voter");
        require(!sender.hasVoted, "Already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");

        sender.hasVoted = true;
        sender.vote = _candidateId;

        candidates[_candidateId].voteCount++;
    }

    function getWinner() public view returns (string memory winnerName) {
        require(votingEnded, "Voting not yet ended");
        require(candidatesCount > 0, "No candidates available");

        uint winningVoteCount = 0;
        uint winningCandidateId = 0;

        for (uint i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winningCandidateId = i;
            }
        }

        // If no votes were cast or there's a tie with 0 votes, return a helpful message
        if (winningCandidateId == 0) {
            return "No votes cast";
        }

        winnerName = candidates[winningCandidateId].name;
    }
}