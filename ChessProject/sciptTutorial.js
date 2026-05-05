// =====================================================
//  scriptTutorial.js
//  Eigenständiges Tutorial-Script – kein scriptChessBoard.js nötig
// =====================================================

// ---- FIGUREN-SYMBOLE ----
const PIECES = {
  wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
  bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟'
};

// ---- HILFSFUNKTIONEN ----
function emptyBoard() {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

function makeBoard(placements) {
  const b = emptyBoard();
  for (const [piece, r, c] of placements) b[r][c] = piece;
  return b;
}

function startingBoard() {
  const b = emptyBoard();
  const row = ['R','N','B','Q','K','B','N','R'];
  for (let c = 0; c < 8; c++) {
    b[0][c] = 'b' + row[c];
    b[1][c] = 'bP';
    b[6][c] = 'wP';
    b[7][c] = 'w' + row[c];
  }
  return b;
}

// =====================================================
//  LEKTIONEN
// =====================================================
const LESSONS = [

  // 0 – Das Schachbrett
  {
    tag: 'Grundlagen',
    title: 'Das Schachbrett',
    desc: `
      <p>Schach wird auf einem Brett mit <strong>64 Feldern</strong> gespielt –
         8 Reihen (Ränge) × 8 Spalten (Linien).</p>
      <p>Die <strong>Spalten</strong> tragen Buchstaben <strong>a–h</strong>
         (links nach rechts aus Sicht von Weiß), die <strong>Reihen</strong>
         Zahlen <strong>1–8</strong> (1 = Weiß-Seite, 8 = Schwarz-Seite).</p>
      <p>Jedes Feld hat eine eindeutige Koordinate, z.&nbsp;B. <strong>e4</strong>
         oder <strong>d7</strong>. Die Felder wechseln zwischen hell und dunkel.</p>
      <p>Weiß spielt von unten, Schwarz von oben.</p>
    `,
    board: startingBoard(),
    highlight: [],
    possible:  [],
    danger:    [],
    selected:  null,
    hint: '♟ Die Startposition – Weiß unten (Reihen 1–2), Schwarz oben (Reihen 7–8).'
  },

  // 1 – Die Figuren
  {
    tag: 'Grundlagen',
    title: 'Die Figuren',
    desc: `
      <p>Jeder Spieler beginnt mit <strong>16 Figuren</strong>:</p>
      <div class="piece-demo"><span class="piece-icon">♔</span><span><strong>König</strong> – die wichtigste Figur (1×)</span></div>
      <div class="piece-demo"><span class="piece-icon">♕</span><span><strong>Dame</strong> – die stärkste Figur (1×)</span></div>
      <div class="piece-demo"><span class="piece-icon">♖</span><span><strong>Turm</strong> – (2×)</span></div>
      <div class="piece-demo"><span class="piece-icon">♗</span><span><strong>Läufer</strong> – (2×)</span></div>
      <div class="piece-demo"><span class="piece-icon">♘</span><span><strong>Springer</strong> – (2×)</span></div>
      <div class="piece-demo"><span class="piece-icon">♙</span><span><strong>Bauer</strong> – (8×)</span></div>
    `,
    board: makeBoard([
      ['wK',7,4],['wQ',7,3],['wR',7,0],['wR',7,7],
      ['wB',7,2],['wB',7,5],['wN',7,1],['wN',7,6],
      ['wP',6,0],['wP',6,1],['wP',6,2],['wP',6,3],
      ['wP',6,4],['wP',6,5],['wP',6,6],['wP',6,7],
      ['bK',0,4],['bQ',0,3],['bR',0,0],['bR',0,7],
      ['bB',0,2],['bB',0,5],['bN',0,1],['bN',0,6],
      ['bP',1,0],['bP',1,1],['bP',1,2],['bP',1,3],
      ['bP',1,4],['bP',1,5],['bP',1,6],['bP',1,7],
    ]),
    highlight: [],
    possible:  [],
    danger:    [],
    selected:  null,
    hint: '♟ Insgesamt 32 Figuren – 16 weiße und 16 schwarze.'
  },

  // 2 – Der Bauer
  {
    tag: 'Figuren & Züge',
    title: 'Der Bauer',
    desc: `
      <p>Der <strong>Bauer ♙</strong> zieht <strong>ein Feld vorwärts</strong>.
         Vom Ausgangsfeld darf er auch <strong>zwei Felder</strong> vorrücken.</p>
      <p>Bauern schlagen <strong>diagonal</strong> – ein Feld schräg vorwärts,
         <em>nicht</em> geradeaus.</p>
      <p>Sonderzüge des Bauern:<br>
         • <strong>Doppelschritt</strong>: vom Start zwei Felder<br>
         • <strong>En passant</strong>: Schlagen „im Vorbeigehen"<br>
         • <strong>Umwandlung</strong>: in letzter Reihe → Dame, Turm, Läufer oder Springer</p>
    `,
    board: makeBoard([
      ['wP',4,4], ['wP',6,1],
      ['bP',3,3], ['bP',1,6]
    ]),
    highlight: [],
    possible:  [[3,4],[2,4]],    // vorwärts von e4
    danger:    [],
    selected:  [4,4],
    hint: '♙ Grüne Punkte = mögliche Züge des weißen Bauern auf e4.'
  },

  // 3 – Der Turm
  {
    tag: 'Figuren & Züge',
    title: 'Der Turm',
    desc: `
      <p>Der <strong>Turm ♖</strong> zieht beliebig viele Felder
         <strong>horizontal oder vertikal</strong>.</p>
      <p>Er kann <em>nicht</em> über andere Figuren hinwegspringen, aber
         feindliche Figuren schlagen.</p>
      <p>Der Turm ist besonders stark auf <strong>offenen Linien</strong>
         (ohne Bauern) und im <strong>Endspiel</strong>, wenn er dem König
         als Begleiter dient.</p>
    `,
    board: makeBoard([['wR',4,4]]),
    highlight: [],
    possible: [
      [0,4],[1,4],[2,4],[3,4],
      [5,4],[6,4],[7,4],
      [4,0],[4,1],[4,2],[4,3],
      [4,5],[4,6],[4,7]
    ],
    danger:   [],
    selected: [4,4],
    hint: '♖ Der Turm auf e4 kontrolliert alle grünen Felder (Kreuzform).'
  },

  // 4 – Der Läufer
  {
    tag: 'Figuren & Züge',
    title: 'Der Läufer',
    desc: `
      <p>Der <strong>Läufer ♗</strong> zieht beliebig viele Felder
         <strong>diagonal</strong>.</p>
      <p>Wichtig: Jeder Läufer bleibt auf seiner <strong>Feldfarbe</strong>.
         Ein Spieler hat stets einen Hell- und einen Dunkelfeld-Läufer.</p>
      <p>Der Läufer entfaltet seine volle Stärke auf offenen Diagonalen ohne
         blockierende Bauern – man spricht von einem <strong>guten Läufer</strong>.</p>
    `,
    board: makeBoard([['wB',4,3]]),
    highlight: [],
    possible: [
      [3,2],[2,1],[1,0],
      [3,4],[2,5],[1,6],[0,7],
      [5,2],[6,1],[7,0],
      [5,4],[6,5],[7,6]
    ],
    danger:   [],
    selected: [4,3],
    hint: '♗ Der Läufer auf d4 – er zieht stets auf dunklen Feldern.'
  },

  // 5 – Der Springer
  {
    tag: 'Figuren & Züge',
    title: 'Der Springer',
    desc: `
      <p>Der <strong>Springer ♘</strong> bewegt sich in einem <strong>„L"</strong>:
         zwei Felder in eine Richtung, dann ein Feld im rechten Winkel.</p>
      <p>Als einzige Figur kann er <strong>über andere Figuren springen</strong> –
         Blockaden spielen für ihn keine Rolle.</p>
      <p>Der Springer ist in der <strong>Brettmitte</strong> besonders stark
         (bis zu 8 Züge!) und in geschlossenen Stellungen oft dem Läufer überlegen.</p>
    `,
    board: makeBoard([['wN',4,4]]),
    highlight: [],
    possible: [
      [2,3],[2,5],[3,2],[3,6],
      [5,2],[5,6],[6,3],[6,5]
    ],
    danger:   [],
    selected: [4,4],
    hint: '♘ Der Springer auf e4 – bis zu 8 Züge im L-Muster!'
  },

  // 6 – Die Dame
  {
    tag: 'Figuren & Züge',
    title: 'Die Dame',
    desc: `
      <p>Die <strong>Dame ♕</strong> ist die stärkste Figur im Schach.
         Sie kombiniert die Züge von <strong>Turm und Läufer</strong>.</p>
      <p>Sie zieht beliebig viele Felder horizontal, vertikal und diagonal –
         in jede Richtung.</p>
      <p>In der Brettmitte kontrolliert eine Dame bis zu
         <strong>27 Felder</strong>! Deshalb sollte man sie nicht zu früh
         ins Spiel bringen, da sie leicht angegriffen werden kann.</p>
    `,
    board: makeBoard([['wQ',4,4]]),
    highlight: [],
    possible: [
      [0,4],[1,4],[2,4],[3,4],[5,4],[6,4],[7,4],
      [4,0],[4,1],[4,2],[4,3],[4,5],[4,6],[4,7],
      [3,3],[2,2],[1,1],[0,0],
      [3,5],[2,6],[1,7],
      [5,3],[6,2],[7,1],
      [5,5],[6,6],[7,7]
    ],
    danger:   [],
    selected: [4,4],
    hint: '♕ Die Dame auf e4 – Turm + Läufer in einer Figur!'
  },

  // 7 – Der König
  {
    tag: 'Figuren & Züge',
    title: 'Der König',
    desc: `
      <p>Der <strong>König ♔</strong> ist die wichtigste Figur –
         er darf niemals geschlagen werden.</p>
      <p>Er zieht nur <strong>ein Feld</strong> in jede Richtung:
         horizontal, vertikal oder diagonal.</p>
      <p>Der König darf <em>nie</em> auf ein bedrohtes Feld ziehen.
         Steht er im Schach, muss er diesem entfliehen.<br>
         <strong>Schachmatt</strong> = kein Ausweg → Partie verloren!</p>
    `,
    board: makeBoard([['wK',4,4]]),
    highlight: [],
    possible: [
      [3,3],[3,4],[3,5],
      [4,3],[4,5],
      [5,3],[5,4],[5,5]
    ],
    danger:   [],
    selected: [4,4],
    hint: '♔ Der König auf e4 – maximal 8 mögliche Felder.'
  },

  // 8 – Rochade
  {
    tag: 'Spezielle Züge',
    title: 'Die Rochade',
    desc: `
      <p>Die <strong>Rochade</strong> ist ein Sonderzug: König und Turm
         tauschen in einem Zug die Plätze.</p>
      <p><strong>Kurze Rochade (0-0)</strong>:<br>
         König e1 → g1, Turm h1 → f1.</p>
      <p><strong>Lange Rochade (0-0-0)</strong>:<br>
         König e1 → c1, Turm a1 → d1.</p>
      <p>Die Rochade ist <em>nicht</em> erlaubt, wenn:<br>
         • König oder Turm bereits gezogen haben<br>
         • Figuren zwischen ihnen stehen<br>
         • Der König im Schach steht oder durch ein bedrohtes Feld zieht</p>
    `,
    board: makeBoard([
      ['wK',7,4],['wR',7,7],['wR',7,0],
      ['wP',6,3],['wP',6,4],['wP',6,5],
      ['bK',0,4],['bR',0,7],['bR',0,0],
      ['bP',1,3],['bP',1,4],['bP',1,5]
    ]),
    highlight: [[7,6],[7,5],[7,2],[7,3]],
    possible:  [],
    danger:    [],
    selected:  [7,4],
    hint: '♔ Grün = mögliche Rochade-Zielfelder. Kurz: g1 f1 | Lang: c1 d1.'
  },

  // 9 – Schach & Schachmatt
  {
    tag: 'Ziel des Spiels',
    title: 'Schach & Schachmatt',
    desc: `
      <p><strong>Schach</strong>: Der König wird direkt bedroht.
         Der Spieler muss sofort reagieren:</p>
      <p>• König <strong>flüchten</strong><br>
         • Angreifer <strong>schlagen</strong><br>
         • Schach <strong>blockieren</strong></p>
      <p><strong>Schachmatt ♚</strong>: Schach ohne Ausweg → Partie vorbei!</p>
      <p><strong>Patt</strong>: Kein Schach, aber auch kein legaler Zug → <em>Remis!</em></p>
      <p>Ziel des Spiels ist es, den gegnerischen König mattzusetzen – nicht ihn zu schlagen.</p>
    `,
    board: makeBoard([
      ['bK',0,7],
      ['wQ',1,5],
      ['wR',2,7],
      ['wK',7,4]
    ]),
    highlight: [],
    possible:  [],
    danger:    [[0,7]],
    selected:  null,
    hint: '♚ Schachmatt! Der schwarze König auf h8 hat keinen einzigen Ausweg.'
  }
];

// =====================================================
//  BOARD RENDERING
// =====================================================
function renderTutorialBoard(lesson) {
  const boardEl = document.getElementById('board');
  if (!boardEl) return;
  boardEl.innerHTML = '';

  const { board, highlight, possible, danger, selected } = lesson;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const isLight = (r + c) % 2 === 0;
      const sq = document.createElement('div');
      sq.className = 'square ' + (isLight ? 'light' : 'dark');

      // Koordinaten
      if (c === 0) {
        const rank = document.createElement('span');
        rank.className = 'coord rank-coord';
        rank.textContent = 8 - r;
        sq.appendChild(rank);
      }
      if (r === 7) {
        const file = document.createElement('span');
        file.className = 'coord file-coord';
        file.textContent = 'abcdefgh'[c];
        sq.appendChild(file);
      }

      // Highlights (grüner Overlay)
      if (highlight && highlight.some(([hr, hc]) => hr === r && hc === c)) {
        sq.classList.add('tut-highlight');
      }

      // Danger (rotes Feld – König im Schach)
      if (danger && danger.some(([dr, dc]) => dr === r && dc === c)) {
        sq.classList.add('tut-danger');
      }

      // Ausgewähltes Feld
      if (selected && selected[0] === r && selected[1] === c) {
        sq.classList.add('tut-selected');
      }

      // Mögliche Züge
      if (possible && possible.some(([pr, pc]) => pr === r && pc === c)) {
        sq.classList.add('tut-possible');
        if (board[r][c]) sq.classList.add('has-piece');
      }

      // Figur
      if (board[r][c]) {
        const p = document.createElement('div');
        p.className = 'piece';
        p.textContent = PIECES[board[r][c]] || '?';
        sq.appendChild(p);
      }

      boardEl.appendChild(sq);
    }
  }
}

// =====================================================
//  LEKTION LADEN
// =====================================================
let currentLesson = 0;

function loadLesson(idx) {
  currentLesson = idx;
  const lesson = LESSONS[idx];
  const total  = LESSONS.length;

  // Brett rendern
  renderTutorialBoard(lesson);

  // Hinweistext
  const hintEl = document.getElementById('board-hint');
  if (hintEl) hintEl.textContent = lesson.hint;

  // Inhalts-Panel
  document.getElementById('lesson-tag').textContent   = lesson.tag;
  document.getElementById('lesson-title').textContent = lesson.title;
  document.getElementById('lesson-desc').innerHTML    = lesson.desc;

  // Fortschritt
  document.getElementById('lesson-progress').textContent = `Lektion ${idx + 1} von ${total}`;
  document.getElementById('progress-bar').style.width = ((idx + 1) / total * 100) + '%';

  // Sidebar hervorheben
  document.querySelectorAll('.lesson-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
    if (i < idx) el.classList.add('done');
    else if (i > idx) el.classList.remove('done');
  });

  // Navigationsknöpfe
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  btnPrev.disabled = (idx === 0);
  btnNext.textContent = (idx === total - 1) ? '✓ Fertig' : 'Weiter ▶';
}

function nextLesson() {
  if (currentLesson < LESSONS.length - 1) {
    loadLesson(currentLesson + 1);
  } else {
    showCompletion();
  }
}

function prevLesson() {
  if (currentLesson > 0) loadLesson(currentLesson - 1);
}

function showCompletion() {
  document.getElementById('lesson-tag').textContent   = '🎉 Geschafft!';
  document.getElementById('lesson-title').textContent = 'Tutorial abgeschlossen!';
  document.getElementById('lesson-desc').innerHTML = `
    <p>Herzlichen Glückwunsch! Du hast alle Grundlagen des Schachs erfolgreich durchgearbeitet.</p>
    <p>Du weißt jetzt, wie sich alle Figuren bewegen, was Schach und Schachmatt bedeutet
       und welche Sonderzüge es gibt.</p>
    <p>Bereit für ein echtes Spiel?</p>
    <p style="text-align:center; margin-top:16px;">
      <a href="playground.html" class="completion-link">♟ Zum Spielfeld</a>
    </p>
  `;

  // Alle Sidebar-Items als fertig markieren
  document.querySelectorAll('.lesson-item').forEach(el => el.classList.add('done'));

  document.getElementById('btn-next').disabled = true;
  document.getElementById('progress-bar').style.width = '100%';
}

// =====================================================
//  LAYOUT SCALER (identisch mit Playground)
// =====================================================
function scaleLayout() {
  const scaler = document.getElementById('game-scaler');
  if (!scaler) return;
  scaler.style.transform = 'none';
  scaler.style.top  = '0px';
  scaler.style.left = '0px';
  const W  = scaler.offsetWidth;
  const H  = scaler.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / W, vh / H, 1);
  scaler.style.left      = Math.round((vw - W * scale) / 2) + 'px';
  scaler.style.top       = Math.round((vh - H * scale) / 2) + 'px';
  scaler.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', scaleLayout);

// =====================================================
//  INITIALISIERUNG
// =====================================================
window.addEventListener('DOMContentLoaded', () => {
  // Seitenleiste dynamisch aufbauen
  const list = document.getElementById('lesson-list');
  LESSONS.forEach((l, i) => {
    const item = document.createElement('div');
    item.className   = 'lesson-item';
    item.id          = 'lesson-item-' + i;
    item.innerHTML   = `<span class="lesson-num">${i + 1}</span><span class="lesson-name">${l.title}</span>`;
    item.addEventListener('click', () => loadLesson(i));
    list.appendChild(item);
  });
});

window.addEventListener('load', () => {
  const loader  = document.getElementById('loader');
  const content = document.getElementById('content');
  setTimeout(() => {
    loader.style.display  = 'none';
    content.style.display = 'block';
    loadLesson(0);
    scaleLayout();
  }, 400);
});

init();