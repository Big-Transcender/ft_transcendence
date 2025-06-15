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

function getUserLeaderboardPosition(nickname) {
	const rows = db.prepare(`
		SELECT u.id, u.nickname, COUNT(m.winner_id) AS wins
		FROM users u
				 LEFT JOIN matches m ON u.id = m.winner_id
		GROUP BY u.id
		ORDER BY wins DESC, u.nickname ASC
	`).all();

	const position = rows.findIndex(row => row.nickname === nickname) + 1;
	return position > 0 ? position : null;
}

module.exports = {
	getLeaderboard,
	getUserLeaderboardPosition,
	insertMatch,
};