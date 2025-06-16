const db = require("./database");

function insertMatch(player1Id, player2Id, winnerId, scoreP1, scoreP2) {
	const stmt = db.prepare(`
		INSERT INTO matches (player1_id, player2_id, winner_id, score_p1, score_p2)
		VALUES (?, ?, ?, ?, ?)
	`);
	return stmt.run(player1Id, player2Id, winnerId, scoreP1, scoreP2);
}

function getLeaderboard() {
	return db.prepare(`
    SELECT u.id, u.nickname, COUNT(m.winner_id) AS wins
    FROM users u
    LEFT JOIN matches m ON u.id = m.winner_id
    GROUP BY u.id
    ORDER BY wins DESC, u.nickname ASC
    LIMIT 5
  `).all();
}

function getUserLeaderboardPosition(userId) {
	const rows = db.prepare(`
    SELECT u.id, u.nickname, COUNT(m.winner_id) AS wins
    FROM users u
    LEFT JOIN matches m ON u.id = m.winner_id
    GROUP BY u.id
    ORDER BY wins DESC, u.nickname ASC
  `).all();

	const position = rows.findIndex(row => row.id === userId) + 1;
	return position > 0 ? position : null;
}


function getUserIdByNickname(nickname) {
	try {
		const stmt = db.prepare('SELECT id FROM users WHERE nickname = ?'); // Use `?` for parameterized queries
		const result = stmt.get(nickname); // Execute the query and fetch a single row
		if (result) {
			return result.id; // Return the user ID
		}
		return null; // Return null if no user is found
	} catch (error) {
		console.error('❌ Error fetching user ID by nickname:', error);
		throw error; // Rethrow the error for further handling
	}
}

module.exports = {
	getLeaderboard,
	getUserLeaderboardPosition,
	insertMatch,
	getUserIdByNickname,
};