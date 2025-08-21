
const { matches} = require('../gameLoop');

module.exports = async function (fastify) {

	fastify.get('/pongGame/:matchId/exists', async (request, reply) => {
		const { matchId } = request.params;
		const match = matches.get(matchId);
		
		return { 
			exists: !!match,
			playerCount: match ? match.clients.size : 0
		};
	});

	fastify.get('/pongGame/activeMatches', async (request, reply) => {
		// Convert the matches Map to an array of match info
		const activeMatches = Array.from(matches.entries()).map(([matchId, match]) => ({
			matchId: matchId,
			playerCount: match.clients.size,
			gameState: match.gameState.started ? 'running' : 'waiting'
		}));

		return { 
			activeMatches,
			totalMatches: matches.size
		};
	});

}