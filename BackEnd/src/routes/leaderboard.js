const { getLeaderboard, getUserLeaderboardPosition, getUserIdByNickname, getNicknameByUserId } = require('../dataQuerys');
const db = require('../database');

module.exports = async function (fastify)
{
	fastify.get('/leaderboard', async (request, reply) => {
		const leaderBoard = getLeaderboard();
		reply.send(leaderBoard);
	});

	fastify.get('/player-matches/:nickname', async (request, reply) => {
			const { nickname } = request.params;
			const userId = getUserIdByNickname(nickname);
			
			if (!userId) {
				return reply.code(404).send({ error: 'User not found' });
			}

			try {
				const matches = db.prepare(`
					SELECT 
						m.id,
						m.score_p1,
						m.score_p2,
						m.tournament_id,
						p1.nickname as player1_nickname,
						p2.nickname as player2_nickname,
						winner.nickname as winner_nickname
					FROM matches m
					JOIN users p1 ON m.player1_id = p1.id
					JOIN users p2 ON m.player2_id = p2.id
					JOIN users winner ON m.winner_id = winner.id
					WHERE m.player1_id = ? OR m.player2_id = ?
					ORDER BY m.id DESC
					LIMIT 5
				`).all(userId, userId);

				const formattedMatches = matches.map(match => {
					const isPlayer1 = match.player1_nickname === nickname;
					const opponent = isPlayer1 ? match.player2_nickname : match.player1_nickname;
					const playerScore = isPlayer1 ? match.score_p1 : match.score_p2;
					const opponentScore = isPlayer1 ? match.score_p2 : match.score_p1;
					const result = match.winner_nickname === nickname ? 'WIN' : 'LOSS';
					
					// ✅ Only 3 things: Result, Score, Opponent
					return {
						result: result,                              // WIN/LOSS
						score: `${playerScore}-${opponentScore}`,    // Score
						opponent: opponent                           // Opponent name
					};
				});

				return reply.send({ matches: formattedMatches });
			} catch (error) {
				console.error('Error fetching match history:', error);
				return reply.code(500).send({ error: 'Internal server error' });
			}
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