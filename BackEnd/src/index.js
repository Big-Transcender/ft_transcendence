const Fastify = require('fastify');
const routes = require('./routes');
const cors = require('@fastify/cors');
const WebSocket = require('ws');


const fastify = Fastify({ logger: true });


async function start()
{
	try {

		await fastify.register(cors, {
			origin: '*', // ⚠️ Accept all origins (for testing)
			// origin: 'http://your-friend-frontend.com', // ✅ In production, use specific domain
		  });
		
		// Manually create and attach WebSocket server using `ws`
		const httpServer = fastify.server;
		const wss = new WebSocket.Server({ server: httpServer });
	
		// Handle WebSocket connections
		wss.on('connection', (ws) => {
			console.log('New WebSocket connection');
	
			// Send a message to the client when they connect
			ws.send('Hello from server Brodah!');

			// Handle incoming messages from the client
			ws.on('message', (message) => {
			console.log('Received message:', message);
			ws.send(` ${message}`); // Echo back the received message
			});
	
			// Handle WebSocket closure
			ws.on('close', () => {
			console.log('WebSocket connection closed');
			});
		});
		
		fastify.register(routes);

		await fastify.listen({port: 3000, host: '0.0.0.0'});
		console.log('Server Started at localhost:3000');
	}
	catch (error) {
		console.error('Failed to Start: ', error);
		process.exit(1);
	}
}


start();