const db = require("./database");

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

module.exports = {
	getLeaderboard,
	getUserLeaderboardPosition,
};