const Fastify = require('fastify');
const routes = require('./routes');
const cors = require('@fastify/cors');

const path = require('path');
const fastifyStatic = require('@fastify/static');

const WebSocket = require('ws');
const {
	updateBall,
	handleInput,
	getGameState
} = require('./gameLogic');


const fastify = Fastify({ logger: true });

async function start() {
	try {
		await fastify.register(cors, { origin: '*' });

		const httpServer = fastify.server;
		const wss = new WebSocket.Server({ server: httpServer });

		let nextPlayer = 'p1'; // start with p1
		const players = new Map(); // ws -> playerId

		wss.on('connection', (ws) => {
			const assignedPlayer = nextPlayer;
			players.set(ws, assignedPlayer);

			// Switch to p2 for next player, then back to p1 for the 3rd connection, etc.
			nextPlayer = (nextPlayer === 'p1') ? 'p2' : 'p1';

			console.log(`New connection assigned to ${assignedPlayer}`);

			ws.send(JSON.stringify({ type: 'state', payload: getGameState() }));

			ws.on('message', (message) =>
			{
				let parsed;
				try {
					parsed = JSON.parse(message.toString());
				} catch {
					console.warn('Invalid JSON:', message.toString());
					return;
				}
				if (parsed.type === 'input') {
					const keys = Array.isArray(parsed.payload) ? parsed.payload : [parsed.payload];
					handleInput(parsed.playerId || 'p1', keys);
				}
				
			});

			ws.on('close', () => {
				console.log(`Connection for ${players.get(ws)} closed`);
				players.delete(ws);
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


		fastify.register(fastifyStatic, {
			root: path.join(__dirname, '../frontEnd'),
			prefix: '/', // Serve index.html at root
		});

		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log('✅ Server started at http://localhost:3000');
	} catch (error) {
		console.error('❌ Failed to start:', error);
		process.exit(1);
	}
}

start();
