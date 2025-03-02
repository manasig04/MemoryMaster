class MemoryGame {
    constructor() {
        this.currentStep = 1; // Track which step we're on
        this.gridSize = 3;
        this.sequenceLength = 4; // Start with 4 bulbs
        this.sequence = [];
        this.playerSequence = [];
        this.isPlaying = false;
        this.canClick = false;
        this.shouldStop = false;
        this.currentTimeout = null;
        
        this.gameGrid = document.getElementById('gameGrid');
        this.startButton = document.getElementById('startButton');
        this.gridSizeDisplay = document.getElementById('gridSize');
        this.sequenceLengthDisplay = document.getElementById('sequenceLength');
        
        this.startButton.textContent = 'READY TO PLAY';
        this.startButton.addEventListener('click', () => this.handleStartButton());
        this.initializeGrid();
        this.updateDisplays(); // Update all displays initially
    }

    showCustomAlert(message) {
        return new Promise((resolve) => {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'custom-alert';
            alertDiv.innerHTML = `
                <div class="alert-content">
                    <p>${message}</p>
                    <button>READY TO PLAY</button>
                </div>
            `;
            
            document.body.appendChild(alertDiv);
            
            const button = alertDiv.querySelector('button');
            button.onclick = () => {
                document.body.removeChild(alertDiv);
                resolve();
            };
        });
    }

    handleStartButton() {
        if (this.isPlaying) {
            // Handle stop - immediately halt all actions
            this.shouldStop = true;
            if (this.currentTimeout) {
                clearTimeout(this.currentTimeout);
                this.currentTimeout = null;
            }
            // Immediately remove all lit states
            const cells = this.gameGrid.getElementsByClassName('cell');
            Array.from(cells).forEach(cell => cell.classList.remove('lit'));
            this.resetGame(false);
        } else {
            this.shouldStop = false;
            this.startGame();
        }
    }

    resetGame(fullReset = true) {
        this.isPlaying = false;
        this.canClick = false;
        this.sequence = [];
        this.playerSequence = [];
        this.shouldStop = false;
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        
        if (fullReset) {
            this.currentStep = 1;
            this.gridSize = 3;
            this.sequenceLength = 4;
        }
        
        this.updateDisplays();
        this.startButton.textContent = 'READY TO PLAY';
        this.initializeGrid();
    }

    initializeGrid() {
        this.gameGrid.innerHTML = '';
        this.gameGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            
            cell.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zM9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z"/>
                </svg>`;
            
            cell.addEventListener('click', () => this.handleCellClick(i));
            this.gameGrid.appendChild(cell);
        }
    }

    async startGame() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.canClick = false;
        this.sequence = [];
        this.playerSequence = [];
        this.startButton.textContent = 'STOP';
        
        // Generate sequence
        for (let i = 0; i < this.sequenceLength; i++) {
            this.sequence.push(Math.floor(Math.random() * (this.gridSize * this.gridSize)));
        }
        
        await this.showSequence();
    }

    updateDifficulty() {
        this.currentStep++;
        
        // Define the progression steps
        switch(this.currentStep) {
            case 1: // Starting point
                this.gridSize = 3;
                this.sequenceLength = 4;
                break;
            case 2: // First progression
                this.gridSize = 4;
                this.sequenceLength = 4;
                break;
            case 3:
                this.gridSize = 4;
                this.sequenceLength = 5;
                break;
            case 4:
                this.gridSize = 4;
                this.sequenceLength = 6;
                break;
            case 5:
                this.gridSize = 5;
                this.sequenceLength = 5;
                break;
            case 6:
                this.gridSize = 5;
                this.sequenceLength = 6;
                break;
            case 7:
                this.gridSize = 5;
                this.sequenceLength = 7;
                break;
            default:
                // For any steps beyond 7, increase sequence length while keeping 5x5 grid
                this.gridSize = 5;
                this.sequenceLength = 7 + (this.currentStep - 7);
        }
    }

    async showSequence() {
        for (let i = 0; i < this.sequence.length; i++) {
            if (this.shouldStop) return;
            
            const cellIndex = this.sequence[i];
            const cell = this.gameGrid.children[cellIndex];
            cell.classList.add('lit');
            
            await new Promise((resolve) => {
                this.currentTimeout = setTimeout(() => {
                    cell.classList.remove('lit');
                    this.currentTimeout = setTimeout(() => {
                        resolve();
                    }, 100);
                }, 500);
            });
            
            if (this.shouldStop) return;
        }
        this.canClick = true;
    }

    handleCellClick(index) {
        if (!this.canClick || !this.isPlaying) return;
        
        const cell = this.gameGrid.children[index];
        cell.classList.add('lit');
        setTimeout(() => cell.classList.remove('lit'), 300);
        
        this.playerSequence.push(index);
        
        if (this.playerSequence[this.playerSequence.length - 1] !== 
            this.sequence[this.playerSequence.length - 1]) {
            this.endGame(false);
            return;
        }
        
        if (this.playerSequence.length === this.sequence.length) {
            this.endGame(true);
        }
    }

    updateDisplays() {
        this.gridSizeDisplay.textContent = `${this.gridSize}x${this.gridSize}`;
        this.sequenceLengthDisplay.textContent = this.sequenceLength;
    }

    endGame(won) {
        this.isPlaying = false;
        this.canClick = false;
        this.startButton.textContent = 'READY TO PLAY';
        
        if (won) {
            this.updateDifficulty();
            this.updateDisplays();
            this.initializeGrid();
            
            this.showCustomAlert('Correct! Memorize the next sequence').then(() => {
                if (!this.shouldStop) {
                    this.startGame();
                }
            });
        } else {
            this.showCustomAlert('Wrong sequence! Try again!').then(() => {
                this.resetGame(false);
            });
        }
    }
}

// Add CSS for custom alert
const style = document.createElement('style');
style.textContent = `
    .custom-alert {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .alert-content {
        background: var(--bg-color);
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        border: 2px solid var(--primary-color);
    }
    
    .alert-content button {
        margin-top: 15px;
        background: var(--primary-color);
        color: var(--bg-color);
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-family: 'Press Start 2P', cursive;
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
window.addEventListener('load', () => {
    new MemoryGame();
});
 