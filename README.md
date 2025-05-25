# 🗳️ Decentralized Voting System

A secure and transparent voting application built on the Ethereum blockchain. This system allows administrators to manage elections and voters to cast their votes confidently, ensuring tamper-proof records and real-time result tracking.

## 🚀 Features

* **Smart Contract Integration**: Utilizes Ethereum smart contracts to manage elections, candidates, and votes.
* **User Roles**:

  * **Administrator**: Can add candidates, approve or reject voter registrations, and control the voting process.
  * **Voter**: Can request registration, cast a vote, and view election results.
* **Real-time Updates**: Immediate reflection of votes and election status.
* **Secure Authentication**: Ensures only authorized users can perform specific actions.
* **Responsive UI**: Built with React, Tailwind CSS for a seamless user experience.

## 🛠️ Technologies Used

* **Frontend**: React 
* **Blockchain**: Ethereum, Solidity
* **Development Tools**: Truffle, Ganache, MetaMask, Web3.js

## 📦 Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Hamza-Bouali/Decentralized-Voting-System.git
   cd Decentralized-Voting-System
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Install Truffle Globally**:

   ```bash
   npm install -g truffle
   ```

4. **Start Ganache**:

   * Download and install [Ganache](https://trufflesuite.com/ganache/).
   * Start Ganache and create a new workspace.

5. **Compile and Migrate Smart Contracts**:

   ```bash
   truffle compile
   truffle migrate
   ```

6. **Configure MetaMask**:

   * Install the [MetaMask](https://metamask.io/) extension in your browser.
   * Connect MetaMask to your local Ganache network.
   * Import an account from Ganache into MetaMask.

7. **Run the Application**:

   * Open `index.html` in your preferred browser.

## 📂 Project Structure

```
Decentralized-Voting-System/
├── contracts/             # Solidity smart contracts
├── migrations/            # Truffle migration scripts
├── public/                # Public assets (e.g., favicon)
├── src/                   # Frontend source code
│   ├── css/               # Tailwind CSS styles
│   ├── js/                # JavaScript files
│   └── html/              # HTML templates
├── truffle-config.js      # Truffle configuration
├── package.json           # Node.js dependencies
└── README.md              # Project documentation
```

## 📸 Screenshots

*(Include screenshots of the application interface here to provide visual context.)*

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

