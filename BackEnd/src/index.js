const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const path = require('path');
const fs = require('fs');
const fastifyStatic = require('@fastify/static');
const setupWebSocket = require('./socketConnection');

async function registerRoutes() {
	const routesDir = path.join(__dirname, 'routes');
	const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

	for (const file of files) {
		const route = require(path.join(routesDir, file));
		await route(fastify);  // each route file is a function that registers routes on fastify
	}
}

async function start() {
	try {
		await fastify.register(cors, { origin: '*' });

		// Setup WebSocket connection
		setupWebSocket(fastify.server);

		// Dynamically register all route files
		await registerRoutes();

		// Serve frontend static files
		fastify.register(fastifyStatic, {
			root: path.join(__dirname, '../../frontEnd'),
			prefix: '/',
		});

		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log('✅ Server started at http://localhost:3000');
	} catch (error) {
		console.error('❌ Failed to start:', error);
		process.exit(1);
	}
}

start();
