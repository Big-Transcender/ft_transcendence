const Database = require("better-sqlite3");

const db = new Database("./db/mydatabase.db");

// USERS table
db.prepare(
`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		nickname TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL,
		email TEXT NOT NULL UNIQUE
	);
`).run();

db.prepare(
    `
    CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code INTEGER NOT NULL UNIQUE,
        created_by INTEGER NOT NULL,
        started BOOL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    `).run();

db.prepare(
    `
    CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tournament_id INTEGER, --nullabe
        player1_id INTEGER NOT NULL,
        player2_id INTEGER NOT NULL,
        winner_id INTEGER NOT NULL,
        rounds INTEGER,
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
        FOREIGN KEY (player1_id) references users(id),
        FOREIGN KEY (player2_id) references users(id),
        FOREIGN KEY (winner_id) references users(id)
    )
    `
).run()

module.exports = db;
