const { getLeaderboard, getUserLeaderboardPosition, getUserIdByNickname, getNicknameByUserId } = require('../dataQuerys');
const db = require('../database');

module.exports = async function (fastify)
{
	fastify.get('/leaderboard', async (request, reply) => {
		const leaderBoard = getLeaderboard();
		reply.send(leaderBoard);
	});


	fastify.get('/player-matches/', { preHandler: fastify.authenticate }, async (request, reply) => {
		const nickname = request.userNickname;

		const userRow = await db.prepare('SELECT id FROM users WHERE nickname = ?').get(nickname);
		if (!userRow) {
			return reply.code(404).send({ error: 'User not found' });
		}
		const userId = userRow.id;

		const matches = await db.prepare(
			`SELECT * FROM matches 
			 WHERE player1_id = ? OR player2_id = ? 
			 ORDER BY match_date DESC 
			 LIMIT 5`
		).all(userId, userId);

		const formattedMatches = await Promise.all(matches.map(async match => {
			const isPlayer1 = match.player1_id === userId;
			const opponentId = isPlayer1 ? match.player2_id : match.player1_id;
			const opponentRow = await db.prepare('SELECT nickname FROM users WHERE id = ?').get(opponentId);
			const opponent = opponentRow ? opponentRow.nickname : 'Unknown';

			const isWinner = match.winner_id === userId;
			const result = isWinner ? 'WIN' : 'LOSS';
			const playerScore = isPlayer1 ? match.score_p1 : match.score_p2;
			const opponentScore = isPlayer1 ? match.score_p2 : match.score_p1;
			return {
				result,
				score: `${playerScore}-${opponentScore}`,
				opponent
			};
		}));

		reply.send(formattedMatches);
	});
	fastify.get('/leaderboard/position/', { preHandler: fastify.authenticate }, async (request, reply) => {
			const nickname = request.userNickname;

			if (!nickname)
				return reply.code(404).send({ error: 'User not found' });

			const position = getUserLeaderboardPosition(nickname);
			if (!position)
				return reply.code(404).send({ error: 'User not found in leaderboard' });

			reply.send({ position });
	});
};