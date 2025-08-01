// Smart contract interaction using ethers.js
class ATMContract {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.contractAddress = "0x0000000000000000000000000000000000000000"; // Replace with deployed contract address
        this.contractABI = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function totalSupply() view returns (uint256)",
            "function balanceOf(address) view returns (uint256)",
            "function claimReward(bytes32 puzzleHash) returns (bool)",
            "function hasClaimed(address) view returns (bool)",
            "function getClaimedCount() view returns (uint256)",
            "function getAvailableCount() view returns (uint256)",
            "function hasAddressClaimed(address) view returns (bool)",
            "function isPuzzleHashUsed(bytes32) view returns (bool)",
            "event TokenClaimed(address indexed claimer, bytes32 puzzleHash, uint256 amount)",
            "event Transfer(address indexed from, address indexed to, uint256 value)"
        ];
        this.isConnected = false;
        this.userAddress = null;
    }

    // Connect to MetaMask
    async connectWallet() {
        try {
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
            }

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Create provider and signer
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();
            
            // Create contract instance
            this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);
            
            // Check if we're on the right network (Sepolia testnet)
            const network = await this.provider.getNetwork();
            if (network.chainId !== 11155111) { // Sepolia chain ID
                throw new Error('Please switch to Sepolia testnet in MetaMask');
            }
            
            this.isConnected = true;
            return {
                success: true,
                address: this.userAddress,
                network: network.name
            };
            
        } catch (error) {
            console.error('Wallet connection error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get user's ATM token balance
    async getBalance(address = null) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }
            
            const targetAddress = address || this.userAddress;
            const balance = await this.contract.balanceOf(targetAddress);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            console.error('Balance fetch error:', error);
            return '0';
        }
    }

    // Check if address has already claimed
    async hasAddressClaimed(address = null) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }
            
            const targetAddress = address || this.userAddress;
            return await this.contract.hasAddressClaimed(targetAddress);
        } catch (error) {
            console.error('Claim status check error:', error);
            return false;
        }
    }

    // Get total claimed tokens count
    async getClaimedCount() {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }
            
            const count = await this.contract.getClaimedCount();
            return count.toString();
        } catch (error) {
            console.error('Claimed count fetch error:', error);
            return '0';
        }
    }

    // Get available tokens count
    async getAvailableCount() {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }
            
            const count = await this.contract.getAvailableCount();
            return count.toString();
        } catch (error) {
            console.error('Available count fetch error:', error);
            return '0';
        }
    }

    // Claim reward with puzzle hash
    async claimReward(puzzleHash) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            if (!this.isConnected) {
                throw new Error('Wallet not connected');
            }

            // Check if user has already claimed
            const alreadyClaimed = await this.hasAddressClaimed();
            if (alreadyClaimed) {
                throw new Error('This address has already claimed a token');
            }

            // Convert puzzle hash to bytes32 format
            const bytes32Hash = ethers.utils.formatBytes32String(puzzleHash);
            
            // Send transaction
            const tx = await this.contract.claimReward(bytes32Hash, {
                gasLimit: 200000 // Set gas limit to avoid estimation issues
            });
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            
            return {
                success: true,
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber
            };
            
        } catch (error) {
            console.error('Claim reward error:', error);
            
            // Parse common error messages
            let errorMessage = error.message;
            if (error.message.includes('already claimed')) {
                errorMessage = 'This address has already claimed a token';
            } else if (error.message.includes('already been used')) {
                errorMessage = 'This puzzle solution has already been used';
            } else if (error.message.includes('All tokens have been claimed')) {
                errorMessage = 'All tokens have been claimed';
            } else if (error.message.includes('user rejected')) {
                errorMessage = 'Transaction was cancelled by user';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient ETH for transaction fees';
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // Listen for events
    setupEventListeners() {
        if (!this.contract) return;

        // Listen for token claims
        this.contract.on('TokenClaimed', (claimer, puzzleHash, amount, event) => {
            console.log('Token claimed:', {
                claimer,
                puzzleHash,
                amount: ethers.utils.formatEther(amount),
                transactionHash: event.transactionHash
            });
            
            // Update UI if this is the current user
            if (claimer.toLowerCase() === this.userAddress?.toLowerCase()) {
                this.updateTokenStats();
            }
        });
    }

    // Update token statistics on the page
    async updateTokenStats() {
        try {
            const claimed = await this.getClaimedCount();
            const available = await this.getAvailableCount();
            
            const claimedElement = document.getElementById('claimed-count');
            const availableElement = document.getElementById('available-count');
            
            if (claimedElement) claimedElement.textContent = claimed + ' ATM';
            if (availableElement) availableElement.textContent = available + ' ATM';
            
        } catch (error) {
            console.error('Error updating token stats:', error);
        }
    }

    // Disconnect wallet
    disconnect() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.isConnected = false;
        this.userAddress = null;
    }
}

// Global contract instance
let atmContract = new ATMContract();

// Initialize the puzzle app
async function initializePuzzleApp() {
    console.log('Initializing AutomaToken Puzzle App...');
    
    // Set up event listeners
    setupEventListeners();
    
    // Update token statistics
    await updateInitialStats();
}

function setupEventListeners() {
    // Connect wallet button
    const connectButton = document.getElementById('connect-wallet');
    if (connectButton) {
        connectButton.addEventListener('click', async
