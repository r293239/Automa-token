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
        connectButton.addEventListener('click', async () => {
            showLoading(true);
            const result = await atmContract.connectWallet();
            showLoading(false);
            
            if (result.success) {
                updateWalletUI(result.address);
                await updateUserBalance();
                await checkClaimStatus();
                atmContract.setupEventListeners();
            } else {
                showError(result.error);
            }
        });
    }

    // Generate puzzle button
    const generateButton = document.getElementById('generate-puzzle');
    if (generateButton) {
        generateButton.addEventListener('click', () => {
            generateNewPuzzle();
        });
    }

    // Check answer button
    const checkButton = document.getElementById('check-answer');
    if (checkButton) {
        checkButton.addEventListener('click', () => {
            checkPuzzleAnswer();
        });
    }

    // Claim token button
    const claimButton = document.getElementById('claim-token');
    if (claimButton) {
        claimButton.addEventListener('click', async () => {
            await claimATMToken();
        });
    }

    // Enter key support for answer input
    const answerInput = document.getElementById('answer-input');
    if (answerInput) {
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !answerInput.disabled) {
                checkPuzzleAnswer();
            }
        });
    }
}

function updateWalletUI(address) {
    const connectButton = document.getElementById('connect-wallet');
    const walletInfo = document.getElementById('wallet-info');
    const walletAddress = document.getElementById('wallet-address');
    
    if (connectButton) {
        connectButton.textContent = 'Connected ✓';
        connectButton.disabled = true;
        connectButton.classList.add('connected');
    }
    
    if (walletInfo && walletAddress) {
        walletAddress.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
        walletInfo.classList.remove('hidden');
    }
}

async function updateUserBalance() {
    try {
        const balance = await atmContract.getBalance();
        const balanceElement = document.getElementById('atm-balance');
        if (balanceElement) {
            balanceElement.textContent = parseFloat(balance).toString();
        }
    } catch (error) {
        console.error('Error updating balance:', error);
    }
}

async function checkClaimStatus() {
    try {
        const hasClaimed = await atmContract.hasAddressClaimed();
        if (hasClaimed) {
            showMessage('This address has already claimed an ATM token.', 'info');
            disablePuzzleInterface();
        }
    } catch (error) {
        console.error('Error checking claim status:', error);
    }
}

function generateNewPuzzle() {
    // Reset previous results
    hideAllMessages();
    
    // Generate new puzzle
    const puzzle = puzzleGenerator.generatePuzzle();
    
    // Update UI
    const questionElement = document.getElementById('puzzle-question');
    const answerInput = document.getElementById('answer-input');
    const checkButton = document.getElementById('check-answer');
    
    if (questionElement) questionElement.textContent = puzzle.question;
    if (answerInput) {
        answerInput.disabled = false;
        answerInput.value = '';
        answerInput.focus();
    }
    if (checkButton) checkButton.disabled = false;
    
    console.log('New puzzle generated:', puzzle.question);
}

function checkPuzzleAnswer() {
    const answerInput = document.getElementById('answer-input');
    if (!answerInput || !answerInput.value.trim()) {
        showError('Please enter an answer');
        return;
    }
    
    const userAnswer = answerInput.value.trim();
    const result = puzzleGenerator.verifyAnswer(userAnswer);
    
    hideAllMessages();
    
    if (result.success) {
        showSuccess('Correct answer! You can now claim your ATM token.');
        enableClaimButton();
    } else {
        showError(`Incorrect answer. The correct answer was: ${result.correctAnswer}`);
        setTimeout(() => {
            generateNewPuzzle(); // Auto-generate new puzzle after wrong answer
        }, 3000);
    }
}

async function claimATMToken() {
    if (!atmContract.isConnected) {
        showError('Please connect your wallet first');
        return;
    }
    
    const puzzleHash = puzzleGenerator.getCurrentHash();
    if (!puzzleHash) {
        showError('No valid puzzle solution found');
        return;
    }
    
    showLoading(true);
    hideAllMessages();
    
    try {
        const result = await atmContract.claimReward(puzzleHash);
        
        if (result.success) {
            showTransactionSuccess(result.transactionHash);
            await updateUserBalance();
            await atmContract.updateTokenStats();
            disablePuzzleInterface();
        } else {
            showTransactionError(result.error);
        }
    } catch (error) {
        showTransactionError(error.message);
    } finally {
        showLoading(false);
    }
}

async function updateInitialStats() {
    try {
        // Try to update stats even without wallet connection
        const dummyContract = new ATMContract();
        dummyContract.provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_INFURA_KEY');
        dummyContract.contract = new ethers.Contract(dummyContract.contractAddress, dummyContract.contractABI, dummyContract.provider);
        
        await dummyContract.updateTokenStats();
    } catch (error) {
        console.log('Could not fetch initial stats (contract not deployed?)');
        // Set default values
        const claimedElement = document.getElementById('claimed-count');
        const availableElement = document.getElementById('available-count');
        if (claimedElement) claimedElement.textContent = '0 ATM';
        if (availableElement) availableElement.textContent = '100 ATM';
    }
}

// UI Helper Functions
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.toggle('hidden', !show);
    }
}

function showSuccess(message) {
    const successBox = document.getElementById('success-message');
    const resultSection = document.getElementById('result-section');
    
    if (successBox && resultSection) {
        successBox.querySelector('p').textContent = message;
        successBox.classList.remove('hidden');
        resultSection.classList.remove('hidden');
    }
}

function showError(message) {
    const errorBox = document.getElementById('error-message');
    const resultSection = document.getElementById('result-section');
    
    if (errorBox && resultSection) {
        errorBox.querySelector('p').textContent = message;
        errorBox.classList.remove('hidden');
        resultSection.classList.remove('hidden');
    }
}

function showTransactionSuccess(txHash) {
    const txSuccess = document.getElementById('tx-success');
    const txResult = document.getElementById('transaction-result');
    const txHashElement = document.getElementById('tx-hash');
    
    if (txSuccess && txResult) {
        if (txHashElement) {
            txHashElement.textContent = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;
            txHashElement.title = txHash;
        }
        txSuccess.classList.remove('hidden');
        txResult.classList.remove('hidden');
    }
}

function showTransactionError(message) {
    const txError = document.getElementById('tx-error');
    const txResult = document.getElementById('transaction-result');
    const txErrorMessage = document.getElementById('tx-error-message');
    
    if (txError && txResult) {
        if (txErrorMessage) txErrorMessage.textContent = message;
        txError.classList.remove('hidden');
        txResult.classList.remove('hidden');
    }
}

function showMessage(message, type = 'info') {
    // Create a temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = 'padding: 10px; margin: 10px 0; border-radius: 5px; background: #e3f2fd; border: 1px solid #2196f3;';
    
    const puzzleSection = document.querySelector('.puzzle-section');
    if (puzzleSection) {
        puzzleSection.insertBefore(messageDiv, puzzleSection.firstChild);
        setTimeout(() => messageDiv.remove(), 5000);
    }
}

function hideAllMessages() {
    const messages = ['success-message', 'error-message', 'tx-success', 'tx-error'];
    messages.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });
    
    const sections = ['result-section', 'transaction-result'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });
}

function enableClaimButton() {
    const claimButton = document.getElementById('claim-token');
    if (claimButton) {
        claimButton.disabled = false;
        claimButton.classList.add('enabled');
    }
}

function disablePuzzleInterface() {
    const elements = ['generate-puzzle', 'answer-input', 'check-answer', 'claim-token'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.disabled = true;
    });
    
    showMessage('This address has already claimed an ATM token. Each address can only claim once.', 'info');
}
