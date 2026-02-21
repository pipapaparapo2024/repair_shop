const db = require('./db');

const migrations = [
  {
    name: '001_create_users',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('dispatcher','master')),
        password TEXT
      );
    `,
  },
  {
    name: '002_create_requests',
    up: `
      CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clientName TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        problemText TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('new','assigned','in_progress','done','canceled')),
        assignedTo INTEGER REFERENCES users(id),
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `,
  },
  {
    name: '003_create_request_history',
    up: `
      CREATE TABLE IF NOT EXISTS request_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requestId INTEGER NOT NULL REFERENCES requests(id),
        prevStatus TEXT,
        nextStatus TEXT NOT NULL CHECK (nextStatus IN ('new','assigned','in_progress','done','canceled')),
        changedBy INTEGER REFERENCES users(id),
        changedAt TEXT NOT NULL
      );
    `,
  },
];

function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      runAt TEXT NOT NULL
    );
  `);

  const existing = new Set(
    db.prepare('SELECT name FROM migrations').all().map((row) => row.name),
  );

  const insertMigration = db.prepare(
    'INSERT INTO migrations (name, runAt) VALUES (?, ?)',
  );

  const now = () => new Date().toISOString();

  const tx = db.transaction(() => {
    migrations.forEach((migration) => {
      if (!existing.has(migration.name)) {
        db.exec(migration.up);
        insertMigration.run(migration.name, now());
      }
    });
  });

  tx();
}

module.exports = { runMigrations };
