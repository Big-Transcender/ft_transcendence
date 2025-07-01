const { matches, createMatch } = require('../gameLoop');
const { createInitialGameState, handleInput } = require('../gameLogic');


module.exports = async function (fastify) {
	// Create a new Pong game
	fastify.post('/pong/game', async (request, reply) => {
		const matchId = "match-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
		createMatch(matchId, createInitialGameState);
		return { matchId };
	});

	// Send player input
	fastify.post('/pong/game/:matchId/input', async (request, reply) => {
		const { matchId } = request.params;
		const { playerId, keys } = request.body;
		const match = matches.get(matchId);
		if (!match)
			return reply.code(404).send({ error: "Match not found" });
		handleInput(match.gameState, playerId, keys);
		return { ok: true };
	});

	// Get game state
	fastify.get('/pong/game/:matchId/state', async (request, reply) => {
		const { matchId } = request.params;
		const match = matches.get(matchId);
		if (!match)
			return reply.code(404).send({ error: "Match not found" });
		return match.gameState;
	});
}