const Fastify = require('fastify');
const routes = require('./routes');

const fastify = Fastify({ logger: true });


async function start()
{
	try {
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