# Automa-token
# 🧩 AutomaToken (ATM) - Puzzle-to-Earn Cryptocurrency

**Solve. Think. Earn.**

AutomaToken is a limited-supply cryptocurrency (100 tokens total) where users earn tokens by solving browser-based puzzles. Built with Solidity smart contracts and vanilla JavaScript, fully hosted on GitHub Pages.

## 🎯 Project Overview

- **Total Supply**: 100 ATM tokens
- **Earning Method**: Solve randomly generated puzzles
- **Network**: Ethereum Sepolia Testnet
- **One Claim Per Address**: Each wallet can only claim once
- **Fully Decentralized**: No backend servers required

## 🚀 Live Demo

Visit: `https://yourusername.github.io/automatoken/`

## 🛠️ How It Works

1. **Connect Wallet**: Connect your MetaMask to Sepolia testnet
2. **Generate Puzzle**: Get a random math, logic, sequence, or word puzzle
3. **Solve & Verify**: Enter your answer, system verifies with SHA-256 hash
4. **Claim Token**: Successfully claim 1 ATM token to your wallet
5. **One Time Only**: Each address can only claim once, forever

## 📁 Project Structure

```
/automatoken
├── index.html          # Landing page
├── puzzle.html         # Main puzzle interface  
├── atm-token.sol       # ERC-20 smart contract
├── contract.js         # Web3 interaction logic
├── puzzle.js           # Puzzle generation & verification
├── ethers.min.js       # Ethereum wallet integration
├── sha256.js           # Cryptographic hashing
├── styles.css          # Modern UI styling
└── README.md           # This file
```

## 🔧 Quick Setup

### 1. Deploy Smart Contract

1. Install MetaMask and get Sepolia testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
2. Deploy `atm-token.sol` using [Remix IDE](https://remix.ethereum.org/)
3. Copy the contract address and update `contractAddress` in `contract.js`

### 2. GitHub Pages Setup

1. Fork this repository
2. Go to Settings → Pages
3. Set source to "Deploy from branch" → `main` → `/root`
4. Your site will be live at `https://yourusername.github.io/automatoken/`

### 3. Configuration

Update these values in `contract.js`:
```javascript
this.contractAddress = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
```

## 🧮 Puzzle Types

The system generates 4 types of puzzles:

### 1. Math Puzzles
- **Easy**: Addition/subtraction (e.g., "What is 7 + 13?")  
- **Medium**: Multiplication/division (e.g., "What is 8 × 9?")
- **Hard**: Complex operations (e.g., "What is (5 + 7) × 3?")

### 2. Sequence Puzzles
- Number patterns (e.g., "2, 4, 6, 8, ?")
- Fibonacci sequences
- Geometric progressions

### 3. Logic Puzzles
- Word problems
- Reasoning challenges
- Critical thinking questions

### 4. Word Puzzles
- Anagrams and unscrambling
- Word riddles
- Spelling challenges

## 🔒 Security Features

- **SHA-256 Hashing**: Puzzle answers are cryptographically hashed
- **On-Chain Verification**: Smart contract validates puzzle solutions
- **Duplicate Prevention**: Same puzzle hash cannot be used twice
- **Address Limiting**: One claim per Ethereum address
- **Gas Optimization**: Efficient contract calls to minimize fees

## 💻 Technical Details

### Smart Contract Functions

```solidity
function claimReward(bytes32 puzzleHash) public returns (bool)
function hasAddressClaimed(address addr) public view returns (bool)  
function getClaimedCount() public view returns (uint256)
function getAvailableCount() public view returns (uint256)
```

### Puzzle Generation Algorithm

1. Random puzzle type selection
2. Dynamic difficulty adjustment  
3. Answer hashing with SHA-256
4. Browser-side verification
5. Smart contract validation

## 🌟 Features

- **No Backend Required**: Pure frontend + blockchain
- **Mobile Responsive**: Works on all devices
- **MetaMask Integration**: Seamless wallet connection
- **Real-time Stats**: Live token count updates
- **Transaction History**: View all claims on blockchain
- **Error Handling**: User-friendly error messages

## 🎨 UI/UX Highlights

- Modern gradient design with glassmorphism effects
- Smooth animations and hover states
- Loading spinners for blockchain interactions
- Success/error message system
- Responsive grid layouts
- Accessibility-friendly contrast ratios

## 🚧 Development Roadmap

### Phase 1: Launch ✅
- [x] Basic puzzle generation
- [x] Smart contract deployment
- [x] GitHub Pages hosting
- [x] MetaMask integration

### Phase 2: Enhancements 🔄
- [ ] Daily puzzle challenges
- [ ] Leaderboard system
- [ ] NFT rewards for solvers
- [ ] Mainnet deployment

### Phase 3: Advanced Features 🔮
- [ ] Multiplayer puzzle battles
- [ ] Token staking mechanisms
- [ ] DAO governance system
- [ ] Mobile app version

## 📋 Testing Checklist

- [ ] **Wallet Connection**: MetaMask connects successfully
- [ ] **Network Check**: Switches to Sepolia testnet
- [ ] **Puzzle Generation**: All 4 puzzle types work
- [ ] **Answer Verification**: Correct/incorrect detection
- [ ] **Token Claiming**: Smart contract call succeeds  
- [ ] **Duplicate Prevention**: Can't claim twice
- [ ] **Balance Updates**: Token balance reflects claims
- [ ] **Transaction Receipts**: Hash displayed correctly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Need Help?

- **Getting Testnet ETH**: Use [Sepolia Faucet](https://sepoliafaucet.com/)
- **MetaMask Setup**: [Installation Guide](https://metamask.io/download/)
- **Contract Issues**: Check console for error messages
- **General Questions**: Open a GitHub issue

### Common Issues

**"Please switch to Sepolia testnet"**
- Add Sepolia network to MetaMask manually
- Chain ID: 11155111
- RPC URL: https://sepolia.infura.io/v3/YOUR_KEY

**"Transaction failed"**
- Ensure sufficient ETH for gas fees
- Check if address already claimed
- Verify puzzle hash is valid

**"Contract not found"**
- Confirm contract is deployed correctly
- Update contract address in `contract.js`
- Check network connection

## 🎊 Fun Facts

- Each puzzle is unique due to random generation
- Answers are hashed client-side for security
- The entire project runs without any servers
- Built with vanilla JavaScript (no frameworks!)
- Smart contract is permanently immutable once deployed

---

**Built with ❤️ for the decentralized future of education and earning.**

*Happy puzzle solving! 🧩*
Copyright © 2025 [r293239]

All rights reserved.

This code and project are provided for public viewing only. Redistribution, modification, commercial use, or any form of reuse is strictly prohibited without express written permission from the author.

This project is not open source.
