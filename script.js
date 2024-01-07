const domGrid = document.getElementById("grid");
let grid = [];

function drawGrid() {
    grid = [];
    domGrid.textContent = "";

    for (let y = 0; y < 4; y += 1) {
        grid.push([]);
        const newRow = domGrid.insertRow();
        for (let x = 0; x < 4; x += 1) {
            grid[y].push(0)
            const newCell = newRow.insertCell();
            newCell.className = "border grid-square";
            newCell.id = `cell*${x}*${y}`;
            newCell.setAttribute("data-x", x);
            newCell.setAttribute("data-y", y);
            const square = document.createElement("div");
            square.id = `number*${x}*${y}`;
            square.className = "number _0"
            square.setAttribute("data-x", x);
            square.setAttribute("data-y", y);
            newCell.append(square);
        }
    }
}

function getAllEmpty() {
    let empty = []
    for (let y = 0; y < grid.length; y += 1) {
        for (let x = 0; x < grid[0].length; x += 1) {
            if (grid[y][x] === 0) { empty.push({x:x, y:y}); }
        }
    }
    return empty;
}

let newlySpawned = [];

function spawnNew() {
    const empty = getAllEmpty();
    if (empty.length > 0) {
        i = Math.floor(empty.length * Math.random());
        newlySpawned.push(`number*${empty[i].x}*${empty[i].y}`);
        grid[empty[i].y][empty[i].x] = 2;
    }
}

function updateDom() {
    for (let y = 0; y < grid.length; y += 1) {
        for (let x = 0; x < grid[0].length; x += 1) {
            const cellVal = grid[y][x];
            const squareID = `number*${x}*${y}`
            const square = document.getElementById(squareID);
            square.className = `number _${cellVal}`;
            square.innerText = cellVal;
            if (newlySpawned.includes(squareID)) {
                console.log(squareID);
                square.classList.add("spawn");
            }
        }
    }
    newlySpawned = [];
    document.getElementById("score").innerText = gameScore;
}

function gridValueAt(x, y) {
    if (x >= 0 && x < grid[0].length && y >= 0 && y < grid.length) {
        return grid[y][x];
    } else {
        return null;
    }
}

function setGridValue(x, y, val) {
    grid[y][x] = val;
}

let gameScore = 0;

function attemptMove(x, y, direction, cycle) {
    const offSet = dir[direction];
    const currentSquareVal = gridValueAt(x, y);
    const destSquareVal = gridValueAt(x + offSet.x, y + offSet.y);
    // Merge
    if (destSquareVal === currentSquareVal && cycle === 3 && currentSquareVal !== 0) {
        setGridValue(x + offSet.x, y + offSet.y, (currentSquareVal * 2));
        setGridValue(x, y, 0)
        moved += 1;
        gameScore += (currentSquareVal * 2);
    // Slide
    } else if (destSquareVal === 0 && currentSquareVal > 0) {
        setGridValue(x + offSet.x, y + offSet.y, currentSquareVal);
        setGridValue(x, y, 0)
        moved += 1;
        // console.log(x, y);
    }
}

// const yMax = grid.length;
// const xMax = grid[0].length;

const yMax = 3;
const xMax = 3;
const yMin = 0;
const xMin = 0;

const dir = {
    up:    { x:  0, y: -1, xRev: false, yRev: false},
    down:  { x:  0, y:  1, xRev: false, yRev: true},
    left:  { x: -1, y:  0, xRev: false, yRev: false},
    right: { x:  1, y:  0, xRev: true,  yRev: false}
}

function correctIndex(number, maxVal, reverse) {
    if (reverse) {
        return maxVal - number;
    }
    return number;
}

function moveAll(direction) {
    const d = dir[direction];
    for (let i = 0; i < 4; i += 1) {
        for (let yStep = 0; yStep <= yMax; yStep += 1) {
            for (let xStep = 0; xStep <= xMax; xStep += 1) {
                const y = correctIndex(yStep, yMax, d.yRev)
                const x = correctIndex(xStep, xMax, d.xRev)
                attemptMove(x, y, direction, i);
            }
        }
    }
}

function getAdjacent(x, y) {
    let positions = []
    const directions = ["up", "down", "left", "right"];
    directions.forEach(direction => {
        const offset = dir[direction];
        const newX = x + offset.x;
        const newY = y + offset.y;
        const newVal = gridValueAt(newX, newY);
        if (newVal !== null) {
            positions.push({x: newX, y: newY});
        }
    });
    return positions;
}


function countPossible() {
    let possible = 0;
    for (let y = 0; y < grid.length; y += 1) {
        for (let x = 0; x < grid[0].length; x += 1) {
            const squareVal = gridValueAt(x, y);
            const adjacent = getAdjacent(x, y);
            adjacent.forEach((pos) => {
                if (gridValueAt(pos.x, pos.y) === squareVal) {
                    possible += 1;
                }
            });
        }
    }
    return possible;
}

let moved = 0;

document.addEventListener('keyup', (event) => {
    const key = event.key
    if (key === "ArrowUp") {
        inputDirection("up");
    } else if (key === "ArrowDown") {
        inputDirection("down");
    } else if (key === "ArrowLeft") {
        inputDirection("left");
    } else if (key === "ArrowRight") {
        inputDirection("right");
    } else {
        return;
    }
});

let hideTutorial = false;

function displayTutorial() {
    const infoBox = document.getElementById("info");
    if (!hideTutorial) {
        infoBox.className = "fade-in";
    } else if (infoBox.className === "fade-in") {
        infoBox.className = "fade-out"
    }
}

const dialog = document.querySelector("dialog");
const restartButton = document.getElementById("restart-button")
restartButton.addEventListener('click', () => {
    dialog.close();
    resetGame();
});
function endGame() {
    dialog.showModal();
    document.querySelector("#final-score").innerText = `Score: ${gameScore}`;
}

function inputDirection(inputDir) {
    hideTutorial = true;
    displayTutorial();
    moveAll(inputDir);
    console.log(countPossible());
    if (moved === 0 && countPossible() === 0) {
        endGame();
    } else if (moved > 0) { 
        spawnNew();
    }
    // console.log(moved);
    moved = 0;
    updateDom();
}

// GESTURE SUPPORT thanks to kirupa.com //

const main = document.getElementById("main")
// const main = document.body
main.addEventListener("touchstart", startTouch, false);
main.addEventListener("touchmove", moveTouch, false);

// Swipe Up / Down / Left / Right
var initialX = null;
var initialY = null;

function startTouch(e) {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
};

function moveTouch(e) {
    if (initialX === null) { return; }
    if (initialY === null) { return; }

    var currentX = e.touches[0].clientX;
    var currentY = e.touches[0].clientY;

    var diffX = initialX - currentX;
    var diffY = initialY - currentY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        // sliding horizontally
        if (diffX > 0) {
            inputDirection("left");
        } else {
            inputDirection("right");
        } 
    } else {
        // sliding vertically
        if (diffY > 0) {
            inputDirection("up");
        } else {
            inputDirection("down");
        } 
    }

    initialX = null;
    initialY = null;

    e.preventDefault();
};

// GESTURE SUPPORT thanks to kirupa.com //

function resetGame() {
    gameScore = 0;
    drawGrid();

    spawnNew();
    spawnNew();
    spawnNew();
    updateDom();
}

function loadGame() {
    setTimeout(() => {
        displayTutorial();
    }, 5000);
    resetGame();
}

loadGame();