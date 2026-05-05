// =====================================================
// server.js – JSON-Server für ChessHelper
// =====================================================
//
// Installation (einmalig):
//   npm install -g json-server
//
// Starten:
//   node server.js
//   ODER direkt:
//   json-server --watch db.json --port 3000
//
// API-Endpunkte (automatisch von json-server):
//   GET    http://localhost:3000/games        → alle Spiele
//   POST   http://localhost:3000/games        → neues Spiel speichern
//   GET    http://localhost:3000/games/:id    → ein Spiel laden
//   DELETE http://localhost:3000/games/:id    → Spiel löschen
//   GET    http://localhost:3000/moves        → alle Züge
//   POST   http://localhost:3000/moves        → Zug speichern
// =====================================================

const { exec } = require('child_process');

console.log('Starte JSON-Server auf http://localhost:3000 ...');
console.log('Drücke Ctrl+C zum Beenden.\n');

const server = exec('json-server --watch db.json --port 3000', (err, stdout, stderr) => {
  if (err) {
    console.error('Fehler:', err.message);
    console.log('\nFalls json-server nicht installiert:');
    console.log('  npm install -g json-server');
  }
});

server.stdout.pipe(process.stdout);
server.stderr.pipe(process.stderr);
