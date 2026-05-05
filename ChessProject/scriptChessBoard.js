//loader
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  const content = document.getElementById("content");

  setTimeout(() => {
    loader.style.display = "none";
    content.style.display = "block";
  }, 400); // 0.4 Sekunden
});

// =====================================================
// LAYOUT for chessboard
// =====================================================

function scaleLayout() {
  const scaler = document.getElementById('game-scaler');
  if (!scaler) return;

  
  scaler.style.transform = 'none';
  scaler.style.top  = '0px';
  scaler.style.left = '0px';

  const W = scaler.offsetWidth;
  const H = scaler.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  
  const scale  = Math.min(vw / W, vh / H, 1);

  
  const left = Math.round((vw - W * scale) / 2);
  const top  = Math.round((vh - H * scale) / 2);

  scaler.style.left      = left + 'px';
  scaler.style.top       = top  + 'px';
  scaler.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', scaleLayout);

// =====================================================
// CHESS ENGINE
// =====================================================

const PIECES = {
  wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
  bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟'
};

const PIECE_VALUES = { P:1, N:3, B:3, R:5, Q:9, K:0 };

let board = [];
let turn = 'white';
let selected = null;
let possibleMoves = [];
let lastMove = null;
let inCheck = false;
let gameOver = false;
let boardFlipped = false;

let enPassantTarget = null;
let castlingRights = { white:{kside:true, qside:true}, black:{kside:true, qside:true} };

let moveHistory = [];
let stateHistory = [];
let historyIndex = -1;

let capturedByWhite = [];
let capturedByBlack = [];

function initBoard() {
  board = Array.from({length:8}, () => Array(8).fill(null));
  const backRow = ['R','N','B','Q','K','B','N','R'];
  for(let c=0;c<8;c++) {
    board[0][c] = {type: backRow[c], color:'black'};
    board[1][c] = {type:'P', color:'black'};
    board[6][c] = {type:'P', color:'white'};
    board[7][c] = {type: backRow[c], color:'white'};
  }
}

function cloneBoard(b) {
  return b.map(row => row.map(cell => cell ? {...cell} : null));
}

function cloneState() {
  return {
    board: cloneBoard(board),
    turn,
    enPassantTarget: enPassantTarget ? {...enPassantTarget} : null,
    castlingRights: JSON.parse(JSON.stringify(castlingRights)),
    lastMove: lastMove ? {from:{...lastMove.from}, to:{...lastMove.to}} : null,
    capturedByWhite: [...capturedByWhite],
    capturedByBlack: [...capturedByBlack],
    inCheck
  };
}

function rawMoves(b, r, c, epTarget, castle) {
  const piece = b[r][c];
  if(!piece) return [];
  const moves = [];
  const {type, color} = piece;
  const opp = color === 'white' ? 'black' : 'white';
  const add = (nr, nc, special) => {
    if(nr>=0&&nr<8&&nc>=0&&nc<8) moves.push({row:nr,col:nc,special:special||null});
  };
  const addSlide = (dr, dc) => {
    let nr=r+dr, nc=c+dc;
    while(nr>=0&&nr<8&&nc>=0&&nc<8) {
      if(b[nr][nc]) { if(b[nr][nc].color===opp) add(nr,nc); break; }
      add(nr,nc); nr+=dr; nc+=dc;
    }
  };

  if(type==='P') {
    const dir = color==='white' ? -1 : 1;
    const startRow = color==='white' ? 6 : 1;
    if(r+dir>=0&&r+dir<8&&!b[r+dir][c]) {
      add(r+dir,c,(r+dir===0||r+dir===7)?'promote':null);
      if(r===startRow&&!b[r+2*dir][c]) add(r+2*dir,c,'doublepush');
    }
    for(const dc of [-1,1]) {
      const nc=c+dc; const nr=r+dir;
      if(nc>=0&&nc<8&&nr>=0&&nr<8) {
        if(b[nr][nc]&&b[nr][nc].color===opp)
          add(nr,nc,(nr===0||nr===7)?'promote':null);
        else if(epTarget&&epTarget.row===nr&&epTarget.col===nc)
          add(nr,nc,'enpassant');
      }
    }
  } else if(type==='N') {
    for(const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const nr=r+dr, nc=c+dc;
      if(nr>=0&&nr<8&&nc>=0&&nc<8&&b[nr][nc]?.color!==color) add(nr,nc);
    }
  } else if(type==='B') {
    for(const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) addSlide(dr,dc);
  } else if(type==='R') {
    for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) addSlide(dr,dc);
  } else if(type==='Q') {
    for(const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) addSlide(dr,dc);
  } else if(type==='K') {
    for(const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
      const nr=r+dr, nc=c+dc;
      if(nr>=0&&nr<8&&nc>=0&&nc<8&&b[nr][nc]?.color!==color) add(nr,nc);
    }
    if(castle) {
      const cr = castle[color];
      const row = color==='white' ? 7 : 0;
      if(r===row&&c===4) {
        if(cr.kside&&!b[row][5]&&!b[row][6]&&b[row][7]?.type==='R'&&b[row][7]?.color===color)
          if(!isAttacked(b,row,4,opp)&&!isAttacked(b,row,5,opp)&&!isAttacked(b,row,6,opp))
            add(row,6,'castle-k');
        if(cr.qside&&!b[row][3]&&!b[row][2]&&!b[row][1]&&b[row][0]?.type==='R'&&b[row][0]?.color===color)
          if(!isAttacked(b,row,4,opp)&&!isAttacked(b,row,3,opp)&&!isAttacked(b,row,2,opp))
            add(row,2,'castle-q');
      }
    }
  }
  return moves;
}

function isAttacked(b, r, c, byColor) {
  for(let rr=0;rr<8;rr++) for(let cc=0;cc<8;cc++) {
    const p=b[rr][cc];
    if(!p||p.color!==byColor) continue;
    const ms = rawMoves(b,rr,cc,null,null);
    if(ms.some(m=>m.row===r&&m.col===c)) return true;
  }
  return false;
}

function findKing(b, color) {
  for(let r=0;r<8;r++) for(let c=0;c<8;c++)
    if(b[r][c]?.type==='K'&&b[r][c]?.color===color) return {r,c};
  return null;
}

function applyMove(b, fromR, fromC, toR, toC, special, promoType) {
  const piece = b[fromR][fromC];
  let captured = b[toR][toC] ? {...b[toR][toC]} : null;
  b[toR][toC] = {...piece};
  b[fromR][fromC] = null;
  if(special==='enpassant') {
    const capR = piece.color==='white' ? toR+1 : toR-1;
    captured = b[capR][toC] ? {...b[capR][toC]} : null;
    b[capR][toC] = null;
  }
  if(special==='castle-k') {
    const row = piece.color==='white'?7:0;
    b[row][5]={type:'R',color:piece.color}; b[row][7]=null;
  }
  if(special==='castle-q') {
    const row = piece.color==='white'?7:0;
    b[row][3]={type:'R',color:piece.color}; b[row][0]=null;
  }
  if(special==='promote') b[toR][toC].type = promoType||'Q';
  return captured;
}

function legalMoves(r, c) {
  const piece = board[r][c];
  if(!piece||piece.color!==turn) return [];
  const raw = rawMoves(board,r,c,enPassantTarget,castlingRights);
  return raw.filter(m => {
    const tb = cloneBoard(board);
    applyMove(tb,r,c,m.row,m.col,m.special,null);
    const king = findKing(tb, piece.color);
    if(!king) return false;
    return !isAttacked(tb,king.r,king.c, piece.color==='white'?'black':'white');
  });
}

function hasAnyLegal(color) {
  for(let r=0;r<8;r++) for(let c=0;c<8;c++)
    if(board[r][c]?.color===color && legalMoves(r,c).length>0) return true;
  return false;
}

function toAlg(r,c){ return 'abcdefgh'[c] + (8-r); }

function moveNotation(fromR, fromC, toR, toC, piece, captured, special, checkStr, promoType) {
  if(special==='castle-k') return '0-0' + checkStr;
  if(special==='castle-q') return '0-0-0' + checkStr;
  let n = '';
  if(piece.type!=='P') n += piece.type;
  else if(captured||special==='enpassant') n += 'abcdefgh'[fromC];
  if(captured||special==='enpassant') n += 'x';
  n += toAlg(toR,toC);
  if(special==='promote') n += '=' + (promoType||'Q');
  n += checkStr;
  return n;
}

// =====================================================
// GAME LOGIC
// =====================================================

function handleSquareClick(r, c) {
  if(gameOver) return;
  if(historyIndex < stateHistory.length-1) { navigateMove('last'); return; }
  const piece = board[r][c];
  if(selected) {
    const move = possibleMoves.find(m=>m.row===r&&m.col===c);
    if(move) {
      if(move.special==='promote') showPromotion(selected.row, selected.col, r, c, move);
      else executeMove(selected.row, selected.col, r, c, move, null);
      selected = null; possibleMoves = [];
      renderBoard(); return;
    }
    selected = null; possibleMoves = [];
  }
  if(piece && piece.color===turn) {
    selected = {row:r, col:c};
    possibleMoves = legalMoves(r,c);
  }
  renderBoard();
}

function showPromotion(fromR, fromC, toR, toC, move) {
  const color = board[fromR][fromC].color;
  const types = ['Q','R','B','N'];
  const symbols = color==='white' ? ['♕','♖','♗','♘'] : ['♛','♜','♝','♞'];
  const container = document.getElementById('promo-pieces');
  container.innerHTML = '';
  types.forEach((t,i) => {
    const btn = document.createElement('button');
    btn.className = 'promo-btn';
    btn.textContent = symbols[i];
    btn.onclick = () => {
      document.getElementById('promotion-overlay').classList.remove('show');
      executeMove(fromR,fromC,toR,toC,move,t);
      renderBoard();
    };
    container.appendChild(btn);
  });
  document.getElementById('promotion-overlay').classList.add('show');
}

function executeMove(fromR, fromC, toR, toC, move, promoType) {
  const piece = board[fromR][fromC];
  const opp = turn==='white'?'black':'white';
  stateHistory.push(cloneState());
  historyIndex = stateHistory.length-1;
  const tb = cloneBoard(board);
  const captured = applyMove(tb, fromR, fromC, toR, toC, move.special, promoType);
  board = tb;
  if(captured) {
    if(turn==='white') capturedByWhite.push(captured);
    else capturedByBlack.push(captured);
  }
  enPassantTarget = null;
  if(move.special==='doublepush')
    enPassantTarget = {row: turn==='white'?toR+1:toR-1, col:toC};
  if(piece.type==='K') { castlingRights[turn].kside=false; castlingRights[turn].qside=false; }
  if(piece.type==='R') {
    if(fromC===0) castlingRights[turn].qside=false;
    if(fromC===7) castlingRights[turn].kside=false;
  }
  if(captured?.type==='R') {
    const capRow = opp==='white'?7:0;
    if(toR===capRow&&toC===0) castlingRights[opp].qside=false;
    if(toR===capRow&&toC===7) castlingRights[opp].kside=false;
  }
  lastMove = {from:{r:fromR,c:fromC}, to:{r:toR,c:toC}};
  turn = opp;
  const king = findKing(board, turn);
  inCheck = king ? isAttacked(board, king.r, king.c, piece.color) : false;
  const anyLegal = hasAnyLegal(turn);
  let checkStr = '';
  if(!anyLegal) checkStr = '#';
  else if(inCheck) checkStr = '+';
  const notation = moveNotation(fromR,fromC,toR,toC,piece,captured,move.special,checkStr,promoType);
  moveHistory.push(notation);
  renderMoveList();
  updatePlayerBars();
  if(!anyLegal) {
    gameOver = true;
    setTimeout(()=>{
      if(inCheck) showGameOver(turn==='white'?'black':'white', 'checkmate');
      else showGameOver(null, 'stalemate');
    }, 300);
  }
  updateStatus();
  // KI-Zug auslösen wenn Modus aktiv und Schwarz am Zug
  if (aiMode && !gameOver && turn === 'black') {
    setTimeout(doAIMove, 400);
  }
}

function showGameOver(winner, reason) {
  const overlay = document.getElementById('gameover-overlay');
  const icon    = document.getElementById('result-icon');
  const title   = document.getElementById('result-title');
  const desc    = document.getElementById('result-desc');
  if(reason==='checkmate') {
    icon.textContent  = winner==='white' ? '♔' : '♚';
    title.textContent = (winner==='white'?'Weiß':'Schwarz') + ' gewinnt!';
    desc.textContent  = 'Durch Schachmatt';
  } else {
    icon.textContent  = '🤝';
    title.textContent = 'Remis';
    desc.textContent  = 'Patt – kein legaler Zug möglich';
  }
  overlay.classList.add('show');
}

function updateStatus() {
  const dot = document.getElementById('turn-dot');
  const txt = document.getElementById('turn-text');
  const msg = document.getElementById('game-message');
  dot.className = turn==='black'?'black':'';
  txt.textContent = (turn==='white'?'Weiß':'Schwarz') + ' am Zug';
  msg.textContent = inCheck ? '⚠ Schach!' : '';
  document.getElementById('white-bar').classList.toggle('active-player', turn==='white'&&!gameOver);
  document.getElementById('black-bar').classList.toggle('active-player', turn==='black'&&!gameOver);
}

function updatePlayerBars() {
  const fmt = (arr) => arr.map(p => PIECES[p.color[0]+p.type]||'').join('');
  document.getElementById('black-captured').textContent = fmt(capturedByBlack);
  document.getElementById('white-captured').textContent = fmt(capturedByWhite);
  const wScore = capturedByWhite.reduce((s,p)=>s+PIECE_VALUES[p.type],0);
  const bScore = capturedByBlack.reduce((s,p)=>s+PIECE_VALUES[p.type],0);
  document.getElementById('white-score').textContent = wScore>bScore?'+'+(wScore-bScore):'';
  document.getElementById('black-score').textContent = bScore>wScore?'+'+(bScore-wScore):'';
}

// =====================================================
// MOVE HISTORY & NAVIGATION
// =====================================================

function renderMoveList() {
  const list = document.getElementById('move-list');
  list.innerHTML = '';
  for(let i=0;i<moveHistory.length;i+=2) {
    const row = document.createElement('div');
    row.className = 'move-row';
    row.innerHTML = `
      <div class="move-num">${i/2+1}.</div>
      <div class="move-w${i===moveHistory.length-1&&turn==='black'?' move-active-cell':''}" onclick="navigateMove(${i})">${moveHistory[i]||''}</div>
      <div class="move-b${i+1===moveHistory.length-1&&turn==='white'?' move-active-cell':''}" onclick="navigateMove(${i+1})">${moveHistory[i+1]||''}</div>
    `;
    list.appendChild(row);
  }
  const cont = document.getElementById('move-list-container');
  cont.scrollTop = cont.scrollHeight;
}

function navigateMove(idx) {
  if(idx==='first') idx=0;
  else if(idx==='prev') idx=Math.max(0,historyIndex-1);
  else if(idx==='next') idx=Math.min(stateHistory.length-1,historyIndex+1);
  else if(idx==='last') idx=stateHistory.length-1;
  if(typeof idx==='number'&&idx>=0&&idx<stateHistory.length) {
    historyIndex=idx;
    const s=stateHistory[idx];
    board=cloneBoard(s.board);
    turn=s.turn; enPassantTarget=s.enPassantTarget;
    castlingRights=JSON.parse(JSON.stringify(s.castlingRights));
    lastMove=s.lastMove; inCheck=s.inCheck;
    capturedByWhite=[...s.capturedByWhite];
    capturedByBlack=[...s.capturedByBlack];
    selected=null; possibleMoves=[];
    renderBoard(); updateStatus(); updatePlayerBars();
  }
}

// =====================================================
// RENDERING
// =====================================================

function renderBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  for(let rr=0;rr<8;rr++) {
    for(let cc=0;cc<8;cc++) {
      const r = boardFlipped ? 7-rr : rr;
      const c = boardFlipped ? 7-cc : cc;
      const sq = document.createElement('div');
      const isLight = (r+c)%2===0;
      sq.className = 'square ' + (isLight?'light':'dark');
      sq.dataset.row = r; sq.dataset.col = c;
      if(cc===0) {
        const rank = document.createElement('span');
        rank.className='coord rank-coord';
        rank.textContent = boardFlipped?(r+1):(8-r);
        sq.appendChild(rank);
      }
      if(rr===7) {
        const file = document.createElement('span');
        file.className='coord file-coord';
        file.textContent = 'abcdefgh'[c];
        sq.appendChild(file);
      }
      if(selected&&selected.row===r&&selected.col===c) sq.classList.add('selected');
      if(lastMove&&((lastMove.from.r===r&&lastMove.from.c===c)||(lastMove.to.r===r&&lastMove.to.c===c)))
        sq.classList.add('last-move');
      if(inCheck&&board[r][c]?.type==='K'&&board[r][c]?.color===turn)
        sq.classList.add('in-check');
      const isPossible = possibleMoves.some(m=>m.row===r&&m.col===c);
      if(isPossible) {
        sq.classList.add('possible');
        if(board[r][c]) sq.classList.add('has-piece');
      }
      if(board[r][c]) {
        const p = board[r][c];
        const pieceEl = document.createElement('div');
        pieceEl.className = 'piece';
        pieceEl.textContent = PIECES[p.color[0]+p.type]||'?';
        sq.appendChild(pieceEl);
      }
      sq.addEventListener('click', () => handleSquareClick(r,c));
      boardEl.appendChild(sq);
    }
  }
}

// =====================================================
// CONTROLS
// =====================================================

function newGame() {
  document.getElementById('gameover-overlay').classList.remove('show');
  document.getElementById('promotion-overlay').classList.remove('show');
  board=[]; turn='white'; selected=null; possibleMoves=[];
  lastMove=null; inCheck=false; gameOver=false;
  enPassantTarget=null;
  castlingRights={white:{kside:true,qside:true},black:{kside:true,qside:true}};
  moveHistory=[]; stateHistory=[]; historyIndex=-1;
  capturedByWhite=[]; capturedByBlack=[];
  initBoard();
  stateHistory.push(cloneState());
  historyIndex=0;
  renderBoard(); renderMoveList(); updateStatus(); updatePlayerBars();
  scaleLayout();
}

function flipBoard() {
  boardFlipped = !boardFlipped;
  renderBoard();
}

// =====================================================
// KI-MODUS (chess-api.com)
// =====================================================

let aiMode = false;
let aiThinking = false;

// Wandelt das aktuelle Brett in einen FEN-String um
function boardToFEN() {
  const pieceMap = {
    wK:'K', wQ:'Q', wR:'R', wB:'B', wN:'N', wP:'P',
    bK:'k', bQ:'q', bR:'r', bB:'b', bN:'n', bP:'p'
  };
  let fen = '';
  for (let r = 0; r < 8; r++) {
    let empty = 0;
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) {
        empty++;
      } else {
        if (empty > 0) { fen += empty; empty = 0; }
        fen += pieceMap[p.color[0] + p.type];
      }
    }
    if (empty > 0) fen += empty;
    if (r < 7) fen += '/';
  }
  // Wer ist am Zug
  fen += ' ' + (turn === 'white' ? 'w' : 'b');
  // Rochaderechte
  let castle = '';
  if (castlingRights.white.kside) castle += 'K';
  if (castlingRights.white.qside) castle += 'Q';
  if (castlingRights.black.kside) castle += 'k';
  if (castlingRights.black.qside) castle += 'q';
  fen += ' ' + (castle || '-');
  // En-passant-Zielfeld
  if (enPassantTarget) {
    fen += ' ' + 'abcdefgh'[enPassantTarget.col] + (8 - enPassantTarget.row);
  } else {
    fen += ' -';
  }
  // Halbzugzähler und Zugnummer (vereinfacht)
  fen += ' 0 ' + (Math.floor(moveHistory.length / 2) + 1);
  return fen;
}

// Holt den nächsten KI-Zug von chess-api.com
async function fetchAIMove() {
  const fen = boardToFEN();
  try {
    const res = await fetch('https://chess-api.com/v1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen, depth: 5 })
    });
    const data = await res.json();
    return data.move || null; // z.B. "e7e5" oder "e7e5q"
  } catch (err) {
    console.error('chess-api.com Fehler:', err);
    return null;
  }
}

// Führt den KI-Zug aus
async function doAIMove() {
  if (aiThinking || gameOver) return;
  aiThinking = true;
  setAIStatus('KI denkt…');

  const moveStr = await fetchAIMove();
  aiThinking = false;

  if (!moveStr || moveStr.length < 4) { setAIStatus(''); return; }

  const fromCol = moveStr.charCodeAt(0) - 97;
  const fromRow = 8 - parseInt(moveStr[1]);
  const toCol   = moveStr.charCodeAt(2) - 97;
  const toRow   = 8 - parseInt(moveStr[3]);
  const promo   = moveStr[4] ? moveStr[4].toUpperCase() : null;

  const moves = legalMoves(fromRow, fromCol);
  const move  = moves.find(m => m.row === toRow && m.col === toCol);
  if (move) {
    executeMove(fromRow, fromCol, toRow, toCol, move, promo);
    renderBoard();
  }
  setAIStatus('');
}

// Zeigt KI-Status in der UI an (falls vorhanden)
function setAIStatus(text) {
  const el = document.getElementById('ai-status');
  if (el) el.textContent = text;
}

// KI-Modus umschalten
function toggleAI() {
  aiMode = !aiMode;
  const btn = document.getElementById('btn-ai');
  if (btn) {
    btn.textContent = aiMode ? 'KI aus' : 'You vs KI';
    btn.classList.toggle('btn-ai-active', aiMode);
  }
  setAIStatus('');
  // Falls Schwarz dran ist und KI gerade aktiviert wurde
  if (aiMode && turn === 'black' && !gameOver) {
    setTimeout(doAIMove, 400);
  }
}

// Hinweis: Tutorial-Logik liegt in sciptTutorial.js (eigenständiges Script)