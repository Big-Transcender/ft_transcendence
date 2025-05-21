const Fastify = require('fastify');
const routes = require('./routes');
const cors = require('@fastify/cors');
const WebSocket = require('ws');

const path = require('path');
const fastifyStatic = require('@fastify/static');

const setupWebSocket = require('./socketConnection');
const {
  updateBall,
  handleInput,
  getGameState
} = require('./gameLogic');

const fastify = Fastify({ logger: true});

async function start() {
	try {
		await fastify.register(cors, { origin: '*' });


		const wss = setupWebSocket(fastify.server, { handleInput, getGameState });

		// Game loop
		setInterval(() => {
			const gameState = getGameState();
			if (gameState.onGoing)
				updateBall();

			const message = JSON.stringify({ type: 'state', payload: gameState });
			wss.clients.forEach(client => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(message);
				}
			
			});
		}, 10); // 60 FPS

		fastify.register(routes);

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