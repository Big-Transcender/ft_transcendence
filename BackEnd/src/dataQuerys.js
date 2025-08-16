const db = require("./database");

function isNicknameTaken(nickname) {
	return db.prepare("SELECT 1 FROM users WHERE nickname = ?").get(nickname) !== undefined;
}

function isEmailTaken(email) {
	return db.prepare("SELECT 1 FROM users WHERE email = ?").get(email) !== undefined;
}

function createUser(nickname, hashedPassword, email) {
	const stmt = db.prepare("INSERT INTO users (nickname, password, email) VALUES (?, ?, ?)");
	return stmt.run(nickname, hashedPassword, email);
}

function getUserByNickname(nickname) {
	const stmt = db.prepare(`SELECT id FROM users WHERE nickname = ?`);
	return stmt.get(nickname);
}

function getTotalGames(userId) {
	const stmt = db.prepare(`
		SELECT COUNT(*) AS total
		FROM matches
		WHERE player1_id = ? OR player2_id = ?
	`);
	return stmt.get(userId, userId).total;
}

function getWins(userId) {
	const stmt = db.prepare(`
		SELECT COUNT(*) AS wins
		FROM matches
		WHERE winner_id = ?
	`);
	return stmt.get(userId).wins;
}

function getPlayerStats(nickname) {
	const user = getUserByNickname(nickname);
	if (!user) return null;

	const userId = user.id;
	const totalGames = getTotalGames(userId);
	const wins = getWins(userId);
	const defeats = totalGames - wins;
	const winPercentage = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(2) : "0.00";

	return {
		nickname,
		games_played: totalGames,
		wins,
		defeats,
		win_percentage: `${winPercentage}%`,
	};
}

function insertMatch(player1Id, player2Id, winnerId, scoreP1, scoreP2) {
	const stmt = db.prepare(`
		INSERT INTO matches (player1_id, player2_id, winner_id, score_p1, score_p2)
		VALUES (?, ?, ?, ?, ?)
	`);
	return stmt.run(player1Id, player2Id, winnerId, scoreP1, scoreP2);
}

function getLeaderboard() {
	return db
		.prepare(
			`
		SELECT u.id, u.nickname, COUNT(m.winner_id) AS wins
		FROM users u
				 LEFT JOIN matches m ON u.id = m.winner_id
		GROUP BY u.id
		ORDER BY wins DESC, u.nickname ASC
			LIMIT 5
	`
		)
		.all();
}

function getUserLeaderboardPosition(nickname) {
	const rows = db
		.prepare(
			`
		SELECT u.id, u.nickname, COUNT(m.winner_id) AS wins
		FROM users u
				 LEFT JOIN matches m ON u.id = m.winner_id
		GROUP BY u.id
		ORDER BY wins DESC, u.nickname ASC
	`
		)
		.all();

	const position = rows.findIndex((row) => row.nickname === nickname) + 1;
	return position > 0 ? position : null;
}

//function getUserIdByNickname(nickname) { TODO falar com bruno
//	return db.prepare("SELECT id FROM users WHERE nickname = ?").get(nickname);
//}

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

function getTournamentByCode(code) {
	return db
		.prepare(
			`
		SELECT t.id, t.name, t.code, t.created_at, u.nickname AS created_by, t.started
		FROM tournaments t
		JOIN users u ON t.created_by = u.id
		WHERE t.code = ?
	`
		)
		.get(code);
}

function createTournament(name, code, createdById, createdAt) {
	const stmt = db.prepare(`
		INSERT INTO tournaments (name, code, created_by, created_at)
		VALUES (?, ?, ?, ?)
	`);
	return stmt.run(name, code, createdById, createdAt);
}

function deleteTournament(code) {
	const tournament = db.prepare('SELECT id FROM tournaments WHERE code = ?').get(code);
	if (!tournament)
		return { changes: 0 };

	const tournamentId = tournament.id;
	const deletePlayers = db.prepare('DELETE FROM tournament_players WHERE tournament_id = ?');
	deletePlayers.run(tournamentId);

	const deleteTournamentStmt = db.prepare('DELETE FROM tournaments WHERE code = ?');
	return deleteTournamentStmt.run(code);
}

function addUserToTournament(tournamentId, userId) {
	const stmt = db.prepare(`
		INSERT INTO tournament_players (tournament_id, user_id)
		VALUES (?, ?)
	`);
	return stmt.run(tournamentId, userId);
}

function getTournamentPlayers(tournamentId) {
	return db
		.prepare(
			`
				SELECT u.id, u.nickname
				FROM tournament_players tp
						 JOIN users u ON tp.user_id = u.id
				WHERE tp.tournament_id = ?
				ORDER BY tp.joined_at ASC
			`
		)
		.all(tournamentId);
}

function hasUserJoinedTournament(tournamentId, userId) {
	return db
		.prepare(
			`
		SELECT 1 FROM tournament_players WHERE tournament_id = ? AND user_id = ?
	`
		)
		.get(tournamentId, userId);
}

function startTournament(code) {
	return db
		.prepare(
			`
		UPDATE tournaments SET started = 1 WHERE code = ?
	`
		)
		.run(code);
}

function getNicknameByUserId(userId) {
    try {
        const stmt = db.prepare('SELECT nickname FROM users WHERE id = ?'); // Use `?` for parameterized queries
        const result = stmt.get(userId); // Execute the query and fetch a single row
        if (result) {
            return result.nickname; // Return the nickname
        }
        return null; // Return null if no user is found
    } catch (error) {
        console.error('❌ Error fetching nickname by user ID:', error);
        throw error; // Rethrow the error for further handling
    }
}

function saveSecret(userId, secret)
{
	const stmt = db.prepare('UPDATE users SET secret = ? WHERE id = ?');
	return stmt.run(secret, userId);
}

function deletePlayerFromTournament(id, userId) {
	try {

		// Remove the user from the tournament
		const stmt = db.prepare(`
			DELETE FROM tournament_players
			WHERE tournament_id = ? AND user_id = ?
		`);
		stmt.run(id, userId);

		console.log(`User ${userId} removed from tournament with code ${id}.`);
		return { success: true, message: "User removed from tournament" };
	} catch (error) {
		console.error("Error removing player from tournament:", error);
		return { success: false, message: "An error occurred while removing the player" };
	}
}

module.exports = {
	isNicknameTaken,
	isEmailTaken,
	createUser,
	getLeaderboard,
	getUserLeaderboardPosition,
	insertMatch,
	getUserByNickname,
	getTotalGames,
	getWins,
	getPlayerStats,
	getUserIdByNickname,
	getNicknameByUserId,
	getTournamentByCode,
	createTournament,
	addUserToTournament,
	getTournamentPlayers,
	hasUserJoinedTournament,
	startTournament,
	deleteTournament,
	deletePlayerFromTournament,
	saveSecret
};
