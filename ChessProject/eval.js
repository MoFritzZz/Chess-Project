// =====================================================
// eval.js – Partieanalyse per Button nach Spielende
// Nur diese Zeile in playground.html einfügen:
//   <script src="eval.js"></script>  ← nach api.js, vor newGame()
// =====================================================

// ── Stellungsbewertung holen ─────────────────────────
async function fetchEval(fen) {
    try {
        const res = await fetch('https://chess-api.com/v1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fen, depth: 10 })
        });
        const data = await res.json();
        if (data.mate != null) {
            const sign = data.turn === 'w' ? 1 : -1;
            return { type: 'mate', value: data.mate * sign };
        }
        if (data.eval != null) {
            const fromWhite = data.turn === 'w' ? data.eval : -data.eval;
            return { type: 'cp', value: fromWhite };
        }
        return null;
    } catch (err) {
        console.error('eval.js:', err);
        return null;
    }
}

// ── Zugklassifikation ────────────────────────────────
function classifyMove(before, after, moveIdx) {
    if (!before || !after) return { icon: '–', label: 'Unbekannt', color: '#888' };
    if (after.type === 'mate') return { icon: 'M', label: 'Matt droht', color: '#9c27b0' };
    if (before.type === 'mate') return { icon: '–', label: '', color: '#888' };
    const isWhite = moveIdx % 2 === 0;
    const improvement = isWhite
        ? (after.value - before.value)
        : (before.value - after.value);
    if (improvement >= 2.0) return { icon: '!!', label: 'Brillant', color: '#00b8d4' };
    if (improvement >= 0.5) return { icon: '!', label: 'Gut', color: '#4caf50' };
    if (improvement >= -0.3) return { icon: '□', label: 'Normal', color: '#aaa' };
    if (improvement >= -1.0) return { icon: '?', label: 'Ungenau', color: '#ff9800' };
    if (improvement >= -2.0) return { icon: '⁈', label: 'Fehler', color: '#f44336' };
    return { icon: '??', label: 'Grober Fehler', color: '#b71c1c' };
}

// ── FEN aus gespeichertem State bauen ────────────────
function buildFENFromState(state) {
    const b = state.board;
    const pieceChar = { K: 'K', Q: 'Q', R: 'R', B: 'B', N: 'N', P: 'P' };
    let fen = '';
    for (let r = 0; r < 8; r++) {
        let empty = 0;
        for (let c = 0; c < 8; c++) {
            const sq = b[r][c];
            if (!sq) { empty++; }
            else {
                if (empty) { fen += empty; empty = 0; }
                const ch = pieceChar[sq.type] || sq.type;
                fen += sq.color === 'white' ? ch : ch.toLowerCase();
            }
        }
        if (empty) fen += empty;
        if (r < 7) fen += '/';
    }
    const t = state.turn === 'white' ? 'w' : 'b';
    const cr = state.castlingRights;
    let castle = '';
    if (cr?.white?.kside) castle += 'K';
    if (cr?.white?.qside) castle += 'Q';
    if (cr?.black?.kside) castle += 'k';
    if (cr?.black?.qside) castle += 'q';
    if (!castle) castle = '-';
    const ep = state.enPassantTarget
        ? String.fromCharCode(97 + state.enPassantTarget.col) + (8 - state.enPassantTarget.row)
        : '-';
    return `${fen} ${t} ${castle} ${ep} 0 1`;
}

// ── Partieanalyse durchführen ────────────────────────
async function runAnalysis() {
    if (!stateHistory || stateHistory.length < 2) {
        alert('Kein Spiel zum Analysieren vorhanden.');
        return;
    }
    const btn = document.getElementById('btn-analyse');
    const results = document.getElementById('analyse-results');
    if (btn) { btn.disabled = true; btn.textContent = 'Analysiere…'; }
    if (results) results.innerHTML = '<div style="color:#aaa;font-size:13px;padding:8px 0;">Züge werden analysiert…</div>';

    const evals = [{ type: 'cp', value: 0 }];
    const total = moveHistory.length;

    for (let i = 0; i < total; i++) {
        if (btn) btn.textContent = `Analysiere… (${i + 1}/${total})`;
        let fen;
        if (i + 1 < stateHistory.length) {
            fen = buildFENFromState(stateHistory[i + 1]);
        } else {
            fen = boardToFEN();
        }
        const ev = await fetchEval(fen);
        evals.push(ev || { type: 'cp', value: 0 });
        await new Promise(r => setTimeout(r, 300));
    }

    renderAnalysis(evals);
    if (btn) { btn.disabled = false; btn.textContent = '🔍 Partie analysieren'; }
}

// ── Analyse-Ergebnisse rendern ───────────────────────
function renderAnalysis(evals) {
    const results = document.getElementById('analyse-results');
    if (!results) return;

    let stats = { white: {}, black: {} };
    ['!!', '!', '□', '?', '⁈', '??', 'M', '–'].forEach(l => { stats.white[l] = 0; stats.black[l] = 0; });

    let rows = '';
    for (let i = 0; i < moveHistory.length; i++) {
        const cls = classifyMove(evals[i], evals[i + 1], i);
        const side = i % 2 === 0 ? 'white' : 'black';
        const moveNum = Math.floor(i / 2) + 1;
        const ev = evals[i + 1];
        const evalStr = ev
            ? (ev.type === 'mate' ? `M${Math.abs(ev.value)}` : (ev.value >= 0 ? '+' : '') + ev.value.toFixed(1))
            : '?';
        if (stats[side][cls.icon] !== undefined) stats[side][cls.icon]++;
        rows += `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
      <span style="color:#888;font-size:12px;width:28px;flex-shrink:0;">${i % 2 === 0 ? moveNum + '.' : ''}</span>
      <span style="width:60px;font-size:13px;flex-shrink:0;">${moveHistory[i]}</span>
      <span style="font-size:13px;font-weight:700;color:${cls.color};width:24px;flex-shrink:0;" title="${cls.label}">${cls.icon}</span>
      <span style="font-size:12px;color:#aaa;font-family:monospace;">${evalStr}</span>
      <span style="font-size:11px;color:#666;margin-left:auto;">${cls.label}</span>
    </div>`;
    }

    const statItems = [
        { icon: '!!', color: '#00b8d4', label: 'Brillant' },
        { icon: '!', color: '#4caf50', label: 'Gut' },
        { icon: '?', color: '#ff9800', label: 'Ungenau' },
        { icon: '⁈', color: '#f44336', label: 'Fehler' },
        { icon: '??', color: '#b71c1c', label: 'Grob' },
    ];
    const statLine = (s) => statItems.map(it =>
        `<span title="${it.label}" style="margin-right:8px;font-size:12px;">
      <span style="color:${it.color};font-weight:700;">${it.icon}</span>
      <span style="color:#ccc;"> ${s[it.icon] || 0}</span>
    </span>`).join('');

    results.innerHTML = `
    <div style="display:flex;gap:16px;margin-bottom:12px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
      <div style="flex:1;"><div style="font-size:12px;color:#aaa;margin-bottom:6px;">♔ Weiß</div>${statLine(stats.white)}</div>
      <div style="width:1px;background:rgba(255,255,255,0.1);"></div>
      <div style="flex:1;"><div style="font-size:12px;color:#aaa;margin-bottom:6px;">♚ Schwarz</div>${statLine(stats.black)}</div>
    </div>
    <div style="max-height:220px;overflow-y:auto;">${rows}</div>`;
}

// ── Patches erst wenn alles geladen ist ──────────────
window.addEventListener('load', () => {

    // showGameOver patchen
    const _origShowGameOver = showGameOver;
    window.showGameOver = function (winner, reason) {
        _origShowGameOver(winner, reason);
        const box = document.querySelector('.gameover-box');
        if (!box || document.getElementById('btn-analyse')) return;
        const btn = document.createElement('button');
        btn.id = 'btn-analyse';
        btn.className = 'btn btn-secondary';
        btn.style = 'width:100%;padding:10px;margin-top:8px;';
        btn.textContent = '🔍 Partie analysieren';
        btn.onclick = runAnalysis;
        box.appendChild(btn);
        const panel = document.createElement('div');
        panel.id = 'analyse-results';
        panel.style = 'margin-top:10px;text-align:left;';
        box.appendChild(panel);
    };

    // newGame patchen
    const _origNewGame = newGame;
    window.newGame = function () {
        _origNewGame();
        const btn = document.getElementById('btn-analyse');
        const res = document.getElementById('analyse-results');
        if (btn) btn.remove();
        if (res) res.remove();
    };

});