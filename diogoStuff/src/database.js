const Database = require('better-sqlite3');

const db = new Database('./db/mydatabase.db');

db.prepare('DROP TABLE IF EXISTS users').run();

db.prepare(`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL,
		email TEXT NOT NULL UNIQUE,
		nickname TEXT NOT NULL UNIQUE
  )
`).run();

module.exports = db;
