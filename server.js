//Json Server

const { exec } = require('child_process');

console.log('Starte JSON-Server auf http://localhost:3000 ...');
console.log('Drücke Ctrl+C zum Beenden.\n');

const server = exec('json-server --watch db.json --port 3000', (err, stdout, stderr) => {
  if (err) {
    console.error('Fehler:', err.message); //error msg*s
    console.log('\nFalls json-server nicht installiert:');
    console.log('  npm install -g json-server');
  }
});

server.stdout.pipe(process.stdout);
server.stderr.pipe(process.stderr);
