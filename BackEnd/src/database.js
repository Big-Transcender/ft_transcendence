const Database = require("better-sqlite3");

const db = new Database("/app/db/mydatabase.db");

// USERS table
db.prepare(
	`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		nickname TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL,
		email TEXT NOT NULL UNIQUE
	)
`
).run();

db.prepare(
	`
	CREATE TABLE IF NOT EXISTS matches (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		player1_id INTEGER NOT NULL,
		player2_id INTEGER NOT NULL,
		winner_id INTEGER NOT NULL,
		score_p1 INTEGER NOT NULL,
		score_p2 INTEGER NOT NULL,
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (player1_id) REFERENCES users(id),
		FOREIGN KEY (player2_id) REFERENCES users(id),
		FOREIGN KEY (winner_id) REFERENCES users(id)
	)
`
).run();

module.exports = db;
