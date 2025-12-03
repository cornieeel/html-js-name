// ---------- DOM ELEMENTS & CONSTANTS ----------

const board = document.getElementById("gameBoard");
const gameMessage = document.getElementById("gameMessage");
const resetButton = document.getElementById("resetBtn");

const boardSize = 25;                     // Number of cells per row/column
const totalCells = Math.pow(boardSize, 2); // Total cells on the board

let score = document.getElementById("score");
score.textContent = 0;                    // Start score at 0

const cells = [];                         // Will hold all board cell elements

// ---------- STATS ELEMENTS ----------

const gamesPlayedDiv = document.getElementById("gamesPlayed");
const lastScoreDiv = document.getElementById("lastScore");
const biggestScoreDiv = document.getElementById("biggestScore");

// ---------- GAME STATE ----------

let snake = [];                           // Stores positions of the snake on the board
let direction = 1;                        // 1=right, -1=left, -boardSize=up, boardSize=down
let food;                                 // Position of the food

let gamesPlayed = 0;
let lastScore = 0;
let biggestScore = 0;

let gameLoop;                             // Will store the setInterval id

// ---------- SETUP FUNCTIONS ----------

// Create all the board cells and store them for later use
function createBoard() {
  for (let i = 0; i < totalCells; i++) {
    const div = document.createElement("div");
    div.classList.add("cell");
    board.appendChild(div);
    cells.push(div);
  }
}

// Load saved stats from localStorage, if they exist
function loadStats() {
  if (localStorage.getItem("gamesPlayed")) {
    gamesPlayed = parseInt(localStorage.getItem("gamesPlayed"));
  }
  if (localStorage.getItem("lastScore")) {
    lastScore = parseInt(localStorage.getItem("lastScore"));
  }
  if (localStorage.getItem("biggestScore")) {
    biggestScore = parseInt(localStorage.getItem("biggestScore"));
  }
}

// Show the current stats in the UI
function updateStats() {
  gamesPlayedDiv.textContent = "Games Played: " + gamesPlayed;
  lastScoreDiv.textContent = "Last Score: " + lastScore;
  biggestScoreDiv.textContent = "Biggest Score: " + biggestScore;
}

// Remove any snake/food styling from the board
function clearBoard() {
  cells.forEach((cell) => cell.classList.remove("snake", "food"));
}

// Start or restart a game: set snake and food positions and reset score
function startGame() {
  clearBoard();

  // Snake starts at a random position
  let start = Math.floor(Math.random() * totalCells);
  snake = [start];

  // Food also starts at a random position
  food = Math.floor(Math.random() * totalCells);

  // Draw snake and food on the board
  snake.forEach((i) => cells[i].classList.add("snake"));
  cells[food].classList.add("food");

  score.textContent = 0;
}

// ---------- INPUT HANDLING ----------

// Change movement direction when arrow keys are pressed
function changeDirection(event) {
  const keyPressed = event.keyCode;

  if (keyPressed === 37) direction = -1;          // Left
  if (keyPressed === 39) direction = 1;           // Right
  if (keyPressed === 38) direction = -boardSize;  // Up
  if (keyPressed === 40) direction = boardSize;   // Down
}

// ---------- GAME LOGIC HELPERS ----------

// Figure out where the new head should be after moving
function getNextHeadPosition() {
  let currentHead = snake[0];
  let newHead = currentHead + direction;

  // Wrap around top/bottom
  if (newHead < 0) newHead += totalCells;
  if (newHead >= totalCells) newHead -= totalCells;

  // Wrap around left/right edges
  if (direction === 1 && newHead % boardSize === 0) {
    newHead -= boardSize;
  }
  if (direction === -1 && newHead % boardSize === boardSize - 1) {
    newHead += boardSize;
  }

  return newHead;
}

// Check if the snake runs into itself
function isSelfCollision(newHead) {
  return snake.includes(newHead);
}

// Handle everything that should happen when the game ends
function handleGameOver() {
  clearInterval(gameLoop);

  gameMessage.textContent = "Game Over!";
  gameMessage.style.display = "block";
  gameMessage.style.color = "red";
  gameMessage.style.marginTop = "20px";
  gameMessage.style.fontFamily = "Permanent Marker, cursive";
  gameMessage.style.fontSize = "40px";

  // Update stats based on the final score
  lastScore = parseInt(score.textContent);
  if (lastScore > biggestScore) {
    biggestScore = lastScore;
  }
  gamesPlayed++;

  localStorage.setItem("lastScore", lastScore);
  localStorage.setItem("biggestScore", biggestScore);
  localStorage.setItem("gamesPlayed", gamesPlayed);

  updateStats();
}

// Move the snake forward and handle eating or removing the tail
function moveSnake(newHead) {
  // Add new head
  snake.unshift(newHead);
  cells[newHead].classList.add("snake");

  // If the head is on the food, grow and place new food
  if (newHead === food) {
    cells[food].classList.remove("food");
    generateFood();
    score.textContent = parseInt(score.textContent) + 1;
  } else {
    // Otherwise remove the last piece (tail)
    const tail = snake.pop();
    cells[tail].classList.remove("snake");
  }
}

// Place food on a random empty cell (not on the snake)
function generateFood() {
  do {
    food = Math.floor(Math.random() * totalCells);
  } while (snake.includes(food));

  cells[food].classList.add("food");
}

// ---------- MAIN GAME LOOP ----------

// This runs repeatedly to move the snake
function moveHead() {
  const newHead = getNextHeadPosition();

  // If the new head position hits the snake, it's game over
  if (isSelfCollision(newHead)) {
    handleGameOver();
    return;
  }

  // Otherwise, move the snake to the new position
  moveSnake(newHead);
}

// ---------- EVENT LISTENERS & STARTUP ----------

// Reset button: stop current game, reset board, and start again
resetButton.addEventListener("click", function () {
  clearInterval(gameLoop);
  clearBoard();
  startGame();
  gameMessage.textContent = "";
  gameMessage.style.display = "none";
  gameLoop = setInterval(moveHead, 250);
});

// Change direction when the player presses an arrow key
document.addEventListener("keydown", changeDirection);

// Initial setup when the page loads
createBoard();
loadStats();
updateStats();
startGame();

// Start the automatic snake movement
gameLoop = setInterval(moveHead, 250);
