// =====================================================
// api.js – Spielstand speichern & laden via JSON-Server
// Einbinden in playground.html / chess.html:
//   <script src="api.js"></script>
// Voraussetzung: server.js läuft (node server.js)
// =====================================================

const API_URL = 'http://localhost:3000';

// ── Spiel speichern ─────────────────────────────────
async function saveGame() {
  if (typeof boardToFEN !== 'function') {
    alert('Fehler: scriptChessBoard.js muss vor api.js geladen sein.');
    return;
  }

  const gameData = {
    date: new Date().toISOString(),
    fen: boardToFEN(),
    moves: [...moveHistory],
    result: gameOver ? (turn === 'white' ? 'Schwarz gewinnt' : 'Weiß gewinnt') : 'laufend'
  };

  try {
    const res = await fetch(`${API_URL}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameData)
    });
    const saved = await res.json();
    alert(`✅ Spiel gespeichert! (ID: ${saved.id})\nDu kannst es mit "Spiel laden" wiederfinden.`);
  } catch (err) {
    alert('❌ Speichern fehlgeschlagen – läuft der JSON-Server? (node server.js)');
    console.error(err);
  }
}

// ── Alle gespeicherten Spiele anzeigen ───────────────
async function listGames() {
  try {
    const res  = await fetch(`${API_URL}/games`);
    const list = await res.json();

    if (list.length === 0) {
      alert('Keine gespeicherten Spiele gefunden.');
      return;
    }

    let msg = 'Gespeicherte Spiele:\n\n';
    list.forEach(g => {
      msg += `ID ${g.id} | ${g.date.slice(0,10)} | ${g.result} | ${g.moves.length} Züge\n`;
    });
    msg += '\nSpiel-ID zum Laden eingeben:';

    const id = prompt(msg);
    if (id) loadGame(id);
  } catch (err) {
    alert('❌ Laden fehlgeschlagen – läuft der JSON-Server? (node server.js)');
    console.error(err);
  }
}

// ── Einzelnes Spiel laden ────────────────────────────
async function loadGame(id) {
  try {
    const res  = await fetch(`${API_URL}/games/${id}`);
    if (!res.ok) { alert(`Kein Spiel mit ID ${id} gefunden.`); return; }
    const game = await res.json();

    // Spielstand wiederherstellen
    newGame();
    alert(
      `Spiel geladen!\nDatum: ${game.date.slice(0,10)}\nZüge: ${game.moves.length}\nErgebnis: ${game.result}\n\nDas Spiel startet neu – Zughistorie kann noch nicht vollständig wiederhergestellt werden.`
    );
  } catch (err) {
    alert('❌ Laden fehlgeschlagen.');
    console.error(err);
  }
}
