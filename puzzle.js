// Puzzle generation and verification
class PuzzleGenerator {
    constructor() {
        this.currentPuzzle = null;
        this.currentHash = null;
    }

    // Generate different types of puzzles
    generatePuzzle() {
        const puzzleTypes = [
            this.generateMathPuzzle,
            this.generateSequencePuzzle,
            this.generateLogicPuzzle,
            this.generateWordPuzzle
        ];
        
        const randomType = Math.floor(Math.random() * puzzleTypes.length);
        const puzzle = puzzleTypes[randomType].call(this);
        
        this.currentPuzzle = puzzle;
        this.currentHash = sha256(puzzle.correctAnswer.toString());
        
        return {
            question: puzzle.question,
            hash: this.currentHash,
            difficulty: puzzle.difficulty || 'medium'
        };
    }

    generateMathPuzzle() {
        const difficulty = Math.random();
        
        if (difficulty < 0.4) {
            // Easy: Simple addition/subtraction
            const a = Math.floor(Math.random() * 20) + 1;
            const b = Math.floor(Math.random() * 20) + 1;
            const operation = Math.random() > 0.5 ? '+' : '-';
            
            if (operation === '+') {
                return {
                    question: `What is ${a} + ${b}?`,
                    correctAnswer: a + b,
                    difficulty: 'easy'
                };
            } else {
                // Ensure positive result
                const larger = Math.max(a, b);
                const smaller = Math.min(a, b);
                return {
                    question: `What is ${larger} - ${smaller}?`,
                    correctAnswer: larger - smaller,
                    difficulty: 'easy'
                };
            }
        } else if (difficulty < 0.7) {
            // Medium: Multiplication or division
            const a = Math.floor(Math.random() * 12) + 2;
            const b = Math.floor(Math.random() * 12) + 2;
            
            if (Math.random() > 0.5) {
                return {
                    question: `What is ${a} × ${b}?`,
                    correctAnswer: a * b,
                    difficulty: 'medium'
                };
            } else {
                // Division with clean result
                const product = a * b;
                return {
                    question: `What is ${product} ÷ ${a}?`,
                    correctAnswer: b,
                    difficulty: 'medium'
                };
            }
        } else {
            // Hard: More complex operations
            const a = Math.floor(Math.random() * 10) + 2;
            const b = Math.floor(Math.random() * 10) + 2;
            const c = Math.floor(Math.random() * 10) + 1;
            
            return {
                question: `What is (${a} + ${b}) × ${c}?`,
                correctAnswer: (a + b) * c,
                difficulty: 'hard'
            };
        }
    }

    generateSequencePuzzle() {
        const sequences = [
            {
                sequence: [2, 4, 6, 8],
                next: 10,
                question: "What comes next in the sequence: 2, 4, 6, 8, ?"
            },
            {
                sequence: [1, 4, 9, 16],
                next: 25,
                question: "What comes next in the sequence: 1, 4, 9, 16, ?"
            },
            {
                sequence: [3, 6, 12, 24],
                next: 48,
                question: "What comes next in the sequence: 3, 6, 12, 24, ?"
            },
            {
                sequence: [1, 1, 2, 3, 5],
                next: 8,
                question: "What comes next in the Fibonacci sequence: 1, 1, 2, 3, 5, ?"
            },
            {
                sequence: [5, 10, 15, 20],
                next: 25,
                question: "What comes next in the sequence: 5, 10, 15, 20, ?"
            }
        ];
        
        const randomSequence = sequences[Math.floor(Math.random() * sequences.length)];
        
        return {
            question: randomSequence.question,
            correctAnswer: randomSequence.next,
            difficulty: 'medium'
        };
    }

    generateLogicPuzzle() {
        const puzzles = [
            {
                question: "If all roses are flowers and some flowers are red, can we conclude that some roses are red? Answer: yes or no",
                correctAnswer: "no"
            },
            {
                question: "A farmer has 17 sheep, and all but 9 die. How many sheep are left?",
                correctAnswer: 9
            },
            {
                question: "What has 4 letters, sometimes has 9 letters, but never has 5 letters. How many letters does 'always' have?",
                correctAnswer: 6
            },
            {
                question: "If you're running a race and you pass the person in 2nd place, what place are you in?",
                correctAnswer: 2
            }
        ];
        
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        
        return {
            question: randomPuzzle.question,
            correctAnswer: randomPuzzle.correctAnswer,
            difficulty: 'hard'
        };
    }

    generateWordPuzzle() {
        const puzzles = [
            {
                question: "Unscramble this word: NOKET (hint: cryptocurrency unit)",
                correctAnswer: "token"
            },
            {
                question: "What 5-letter word becomes shorter when you add two letters to it?",
                correctAnswer: "short"
            },
            {
                question: "Rearrange LISTEN to make a word meaning 'not speaking'",
                correctAnswer: "silent"
            },
            {
                question: "What word is spelled incorrectly in every dictionary?",
                correctAnswer: "incorrectly"
            }
        ];
        
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        
        return {
            question: randomPuzzle.question,
            correctAnswer: randomPuzzle.correctAnswer,
            difficulty: 'medium'
        };
    }

    // Verify user's answer
    verifyAnswer(userAnswer) {
        if (!this.currentPuzzle) {
            return { success: false, message: "No puzzle generated yet" };
        }

        // Normalize the answer (lowercase, trim whitespace)
        const normalizedUser = userAnswer.toString().toLowerCase().trim();
        const normalizedCorrect = this.currentPuzzle.correctAnswer.toString().toLowerCase().trim();
        
        const isCorrect = normalizedUser === normalizedCorrect;
        
        return {
            success: isCorrect,
            correctAnswer: this.currentPuzzle.correctAnswer,
            hash: this.currentHash,
            message: isCorrect ? "Correct! You can now claim your token." : "Incorrect answer. Try again!"
        };
    }

    // Get current puzzle hash (for smart contract)
    getCurrentHash() {
        return this.currentHash;
    }

    // Reset puzzle state
    reset() {
        this.currentPuzzle = null;
        this.currentHash = null;
    }
}

// Global puzzle generator instance
let puzzleGenerator = new PuzzleGenerator();

// Generate time-based seed for daily puzzles (optional future feature)
function generateDailySeed() {
    const today = new Date();
    const dateString = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    return sha256(dateString);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PuzzleGenerator, generateDailySeed };
}
