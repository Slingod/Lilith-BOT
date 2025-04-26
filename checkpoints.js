// checkpoints.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/database.sqlite', err => {
  if (err) return console.error('Erreur ouverture DB', err);
});
db.all("SELECT id, points, lastVoice FROM users", [], (err, rows) => {
  if (err) return console.error(err);
  console.table(rows);
  process.exit(0);
});
