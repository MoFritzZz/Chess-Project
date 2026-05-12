// =====================================================
// eval.js – KI-Gegner für den Playground
// Einbinden in playground.html (einzige Änderung nötig):
//   <script src="eval.js"></script>  ← vor </body> einfügen
// =====================================================

// ── KI-Zug von chess-api.com holen ──────────────────
async function fetchAIMove() {
    const fen = boardToFEN();
    try {
        const res = await fetch('https://chess-api.com/v1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fen, depth: 5 })
        });
        const data = await res.json();
        return data.move || null;
    } catch (err) {
        console.error('eval.js: chess-api.com Fehler', err);
        return null;
    }
}

// ── KI-Zug ausführen ────────────────────────────────
async function doAIMove() {
    if (aiThinking || gameOver) return;
    aiThinking = true;
    setAIStatus('KI denkt…');

    const moveStr = await fetchAIMove();
    aiThinking = false;

    if (!moveStr || moveStr.length < 4) { setAIStatus(''); return; }

    const fromCol = moveStr.charCodeAt(0) - 97;
    const fromRow = 8 - parseInt(moveStr[1]);
    const toCol = moveStr.charCodeAt(2) - 97;
    const toRow = 8 - parseInt(moveStr[3]);
    const promo = moveStr[4] ? moveStr[4].toUpperCase() : null;

    const moves = legalMoves(fromRow, fromCol);
    const move = moves.find(m => m.row === toRow && m.col === toCol);
    if (move) {
        executeMove(fromRow, fromCol, toRow, toCol, move, promo);
        renderBoard();
    }
    setAIStatus('');
}

// ── toggleAI überschreiben ───────────────────────────
function toggleAI() {
    aiMode = !aiMode;
    const btn = document.getElementById('btn-ai');
    if (btn) {
        btn.textContent = aiMode ? '🤖 KI aus' : '🤖 vs KI';
        btn.classList.toggle('btn-ai-active', aiMode);
    }
    setAIStatus('');
    if (aiMode && turn === 'black' && !gameOver) {
        setTimeout(doAIMove, 400);
    }
}

// ── executeMove patchen: KI nach jedem Weiß-Zug auslösen ──
const _origExecuteMove = executeMove;

function executeMove(fromR, fromC, toR, toC, move, promoType) {
    _origExecuteMove(fromR, fromC, toR, toC, move, promoType);
    if (aiMode && !gameOver && turn === 'black') {
        setTimeout(doAIMove, 400);
    }
}

// ── handleSquareClick patchen: Schwarz sperren wenn KI aktiv ──
const _origHandleSquareClick = handleSquareClick;

function handleSquareClick(r, c) {
    if (aiThinking) return;
    if (aiMode) {
        const piece = board[r][c];
        if (!selected && piece && piece.color === 'black') return;
    }
    _origHandleSquareClick(r, c);
}

