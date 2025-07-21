
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

}