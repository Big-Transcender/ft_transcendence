const db = require("./database");

function insertMatch(player1Id, player2Id, winnerId, scoreP1, scoreP2) {
	const stmt = db.prepare(`
		INSERT INTO matches (player1_id, player2_id, winner_id, score_p1, score_p2)
		VALUES (?, ?, ?, ?, ?)
	`);
	return stmt.run(player1Id, player2Id, winnerId, scoreP1, scoreP2);
}

function getLeaderboard() {
	const stmt = db.prepare(`
		SELECT u.nickname, COUNT(m.winner_id) AS wins
		FROM users u
		LEFT JOIN matches m ON u.id = m.winner_id
		GROUP BY u.id
		ORDER BY wins DESC
		LIMIT 5
	`);
	return stmt.all();
}

function getUserMatchHistory(userId) {
	const stmt = db.prepare(`
		SELECT * FROM matches
		WHERE player1_id = ? OR player2_id = ?
		ORDER BY match_date DESC
	`);
	return stmt.all(userId, userId);
}

module.exports = {
	insertMatch,
	getLeaderboard,
	getUserMatchHistory,
};
