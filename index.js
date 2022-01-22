const fs = require("fs");
let { performance } = require("perf_hooks");

let args = process.argv.slice(2);
let inputFile;
if (args.length > 0 && args.includes('test')) {
    inputFile = 'test.txt';
} else {
    inputFile = 'input.txt';
}
let stopOnFirstWinner = false;
if (args.length > 0 && args.includes('part:1')) {
    stopOnFirstWinner = true;
}

const start = performance.now();

// Load and split data into array chunks separeted by empty lines
const data = fs
    .readFileSync(inputFile, { encoding: "utf-8" })
    .split(/(\r\n|\n){2,}/)
    .map((x) => x.trim())
    // Removing empty elements
    .filter((x) => Boolean(x));

// Split first line of data
let [numbersToParse, ...boardsToParse] = data;

// Read numbers data
let numbers = numbersToParse
    .trim()
    .split(',')
    .map((x) => parseInt(x));

// Read boards data
let boards = boardsToParse
    .map((board) => board
        .trim()
        .split(/(\r\n|\n)+/)
        .map((row) => row.trim())
        .filter(row => Boolean(row))
        .map((row) => row
            .trim()
            .split(/\s+/)
            // Change bingo board number to object with checked property
            .map((n) => ({ number: parseInt(n), checked: false }))
        )
    );

let firstWinnerScore;
let lastWinnerScore;
const winners = [];

// Iterate throgh all numbers drawn
for (const number of numbers) {
    boards.forEach((board) => board
        .forEach((row) => row
            .filter((n) => !n.checked)
            // Find if number should be checked on board
            .forEach((n) => (n.checked = number === n.number))
        )
    );

    // Find if any board wins
    boards.forEach((board, i) => {
        if (!winners.includes(i) && checkIfLinesFull(board)) {
            winners.push(i);           
        }
    });

    // Calculate score for first winner if any
    if (typeof firstWinnerScore === 'undefined' && winners.length > 0) {
        const firstWinnerBoard = boards[winners[0]];
        firstWinnerScore = getScore(firstWinnerBoard, number);
    }

    // When all boards are winners calculate score for last winner
    if (winners.length === boards.length) {
        const lastWinnerBoard = boards[winners[winners.length - 1]];
        lastWinnerScore = getScore(lastWinnerBoard, number);
        break;
    }
}

function checkIfLinesFull(board) {
    let columns = board[0].map((x, i) => board.map(x => x[i]));
    return board.some((row) => row.every((n) => n.checked)) ||
        columns.some((column) => column.every((n) => n.checked));
}

function getScore(board, number) {
    const sum = board
        .flatMap((row) => row.filter((n) => !n.checked))
        .map((n) => n.number)
        .reduce((a, b) => a + b);
    return sum * number;
}

console.log(`Part 1 result: ${firstWinnerScore}`);
if (!stopOnFirstWinner) {
    console.log(`Part 2 result: ${lastWinnerScore}`);
}
const time = performance.now() - start;
console.log(`Solved in ${time.toFixed(2)} ms`);