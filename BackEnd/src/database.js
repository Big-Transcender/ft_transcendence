const Database = require("better-sqlite3");
const db = new Database("app/db/mydatabase.db");

// USERS table
db.prepare(
	`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		nickname TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL,
		email TEXT NOT NULL UNIQUE,
		two_factor_enable BOOLEAN DEFAULT false,
		two_factor_secret TEXT,
		avatar TEXT
	);
`
).run();

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
    `
).run();

db.prepare(
	`
	CREATE TABLE IF NOT EXISTS matches (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		tournament_id INTEGER, -- nullable
		player1_id INTEGER NOT NULL,
		player2_id INTEGER NOT NULL,
		winner_id INTEGER NOT NULL,
		score_p1 INTEGER NOT NULL,
		score_p2 INTEGER NOT NULL,
		date_match DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
		FOREIGN KEY (player1_id) REFERENCES users(id),
		FOREIGN KEY (player2_id) REFERENCES users(id),
		FOREIGN KEY (winner_id) REFERENCES users(id)
	)
	`
).run();

db.prepare(
	`
	CREATE TABLE IF NOT EXISTS tournament_players (
		tournament_id INTEGER,
		user_id INTEGER,
		joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (tournament_id, user_id),
		FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
		FOREIGN KEY (user_id) REFERENCES users(id)
	)
`
).run();

db.prepare(`
	CREATE TABLE IF NOT EXISTS friends (
		user_id INTEGER NOT NULL,
		friend_id INTEGER NOT NULL,
		PRIMARY KEY (user_id, friend_id),
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
		CHECK ( user_id < friend_id )
	)
	`
).run();

// Update a user's avatar
function updateUserAvatar(userId, avatarFilename) {
	db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatarFilename, userId);
}

db.updateUserAvatar = updateUserAvatar;
module.exports = db;
