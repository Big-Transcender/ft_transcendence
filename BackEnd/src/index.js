const Fastify = require('fastify');
const routes = require('./routes');
const cors = require('@fastify/cors');

const path = require('path');
const fastifyStatic = require('@fastify/static');

const setupWebSocket = require('./socketConnection');
const { startGameLoop, startGameLoopLocal } = require('./gameLoop');

const {
  updateBall,
  handleInput,
  resetGame,
  getGameState
} = require('./gameLogic');

const fastify = Fastify({ logger: true});

async function start() {
	try {
		await fastify.register(cors, { origin: '*' });

		// Connection to players
		const wss = setupWebSocket(fastify.server, { handleInput, getGameState, resetGame });

		// Game loop
		//startGameLoop(wss, { getGameState, updateBall });
		startGameLoopLocal(wss, { getGameState, updateBall });

		fastify.register(routes);

		// For connecting the front to the back
		fastify.register(fastifyStatic, {
			root: path.join(__dirname, '../frontEnd'),
			prefix: '/',
		});

		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log('✅ Server started at http://localhost:3000');
	}
	
	catch (error) {
		console.error('❌ Failed to start:', error);
		process.exit(1);
	}
}

start();