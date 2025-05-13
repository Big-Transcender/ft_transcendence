const Fastify = require('fastify');
const routes = require('./routes');
const cors = require('@fastify/cors');
const WebSocket = require('ws');
const {
	movePaddle,
	updateBall,
	getGameState
} = require('./gameLogic');


const fastify = Fastify({ logger: true });

async function start() {
	try {
		await fastify.register(cors, { origin: '*' });

		const httpServer = fastify.server;
		const wss = new WebSocket.Server({ server: httpServer });

		wss.on('connection', (ws) => {
			console.log('New WebSocket connection');
			ws.send(JSON.stringify({ type: 'state', payload: getGameState() }));

			ws.on('message', (message) => {
				let parsed;
				try {
					parsed = JSON.parse(message.toString());
				} catch {
					console.warn('Invalid JSON:', message.toString());
					return;
				}

				if (parsed.type === 'input') {
					const key = parsed.payload;
					if (key === 'ArrowUp') movePaddle('p2', 'up');
					else if (key === 'ArrowDown') movePaddle('p2', 'down');
					else if (key === 'w') movePaddle('p1', 'up');
					else if (key === 's') movePaddle('p1', 'down');
				}
			});

			ws.on('close', () => {
				console.log('WebSocket connection closed');
			});
		});

		// Game loop
		setInterval(() => {
			updateBall();
			const gameState = getGameState();
			const message = JSON.stringify({ type: 'state', payload: gameState });

			wss.clients.forEach(client => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(message);
				}
			});
		}, 15); // 60 FPS

		fastify.register(routes);
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log('✅ Server started at http://localhost:3000');
	} catch (error) {
		console.error('❌ Failed to start:', error);
		process.exit(1);
	}
}

start();
