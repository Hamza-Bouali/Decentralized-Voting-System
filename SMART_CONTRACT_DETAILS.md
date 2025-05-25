# Smart Contract Details

This document provides detailed information about the smart contracts used in the VDapp voting system.

## Voting Contract

The main contract for managing the voting process is located at `contracts/VotingContract.sol`.

### Key Features

- Registration and verification of voters
- Addition of candidates
- Vote casting with validation
- Vote counting and result calculation
- Admin controls for voting phases

### Contract Structure

#### State Variables

- `owner`: The address of the contract owner (admin)
- `candidates`: Mapping of candidates with their details
- `candidatesCount`: Total number of candidates
- `voters`: Mapping of voter addresses to their voting status
- `votingStarted`: Boolean indicating if voting has started
- `votingEnded`: Boolean indicating if voting has ended
- `registrationRequests`: Array of addresses requesting voter registration

#### Key Functions

##### Admin Functions

- `addCandidate(string memory _name)`: Adds a new candidate
- `approveVoter(address _voter)`: Approves a voter registration
- `rejectVoterRequest(address _voter)`: Rejects a voter registration request
- `startVoting()`: Begins the voting period
- `endVoting()`: Ends the voting period
- `resetVoting()`: Resets the voting for a new session

##### Voter Functions

- `requestVoterRegistration()`: Allows an address to request voting rights
- `vote(uint256 _candidateId)`: Casts a vote for a candidate

##### View Functions

- `getRegistrationRequests()`: Returns all pending registration requests
- `getWinner()`: Returns the winning candidate when voting is ended

### Events

- `VoterRegistrationRequested`: Emitted when a voter requests registration
- `VoterApproved`: Emitted when a voter is approved
- `VoterRejected`: Emitted when a voter request is rejected

### Security Considerations

- Only the owner can approve voters and manage candidates
- A voter can only vote once
- A vote can only be cast during the active voting period
- Only registered voters can vote
- The contract implements function modifiers to control access to admin functions

### Contract Deployment

The contract is deployed to the Ethereum blockchain with a specified owner address that becomes the admin. The current deployment is at address `0xE9732d3A3dFCaf5Bc35B37781E6639Bba25DBe11` on the test network.

## Testing

Smart contract tests are available in the `contracts/test/` directory. Run tests with:

```bash
npx hardhat test
```

## Upgradeability

The current contract is not upgradeable. Future versions may implement a proxy pattern for upgradeability.
