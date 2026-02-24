window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  const content = document.getElementById("content");

  setTimeout(() => {
    loader.style.display = "none";
    content.style.display = "block";
  }, 400); // 1.5 Sekunden
});

/* ab hier playground */ 
const board = document.querySelector(".board");
const resetBtn = document.getElementById("reset");

const pieces = {
  rook: "♖",
  knight: "♘",
  bishop: "♗",
  queen: "♕",
  king: "♔",
  pawn: "♙"
};

function createBoard() {
  board.innerHTML = "";

  for (let row = 8; row >= 1; row--) {
    // Numbers
    const number = document.createElement("div");
    number.classList.add("number");
    number.textContent = row;
    board.appendChild(number);

    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.classList.add("square");

      const isWhite = (row + col) % 2 === 0;
      square.classList.add(isWhite ? "white" : "black");

      square.addEventListener("dragover", e => e.preventDefault());
      square.addEventListener("drop", drop);

      board.appendChild(square);
    }
  }

  placeWhitePieces();
}

function placeWhitePieces() {
  const squares = document.querySelectorAll(".square");

  // Pawns
  for (let i = 8; i < 16; i++) {
    addPiece(squares[i], pieces.pawn);
  }

  // Back row
  const order = [
    pieces.rook,
    pieces.knight,
    pieces.bishop,
    pieces.queen,
    pieces.king,
    pieces.bishop,
    pieces.knight,
    pieces.rook
  ];

  order.forEach((piece, i) => {
    addPiece(squares[i], piece);
  });
}

function addPiece(square, symbol) {
  const piece = document.createElement("div");
  piece.textContent = symbol;
  piece.classList.add("piece");
  piece.draggable = true;

  piece.addEventListener("dragstart", dragStart);
  square.appendChild(piece);
}

let draggedPiece = null;

function dragStart(e) {
  draggedPiece = e.target;
}

function drop(e) {
  if (draggedPiece) {
    e.target.innerHTML = "";
    e.target.appendChild(draggedPiece);
    draggedPiece = null;
  }
}

resetBtn.addEventListener("click", createBoard);

createBoard();
