const fastify = require('fastify')({logger: true});
const setupDatabase = require('./database');
const routes = require('./routes');


async function start()
{
	try {
		await setupDatabase(fastify);
		fastify.register(routes);
		
		fastify.get('/', async (request, reply) => {
			return { message: 'Hello Bitches! 🎉 Fastify is alive.' };
		});

		await fastify.listen({port: 3000});
		console.log('Server Started at localhost:3000');
	}
	catch (error) {
		console.error('Failed to Start: ', error);
		process.exit(1);
	}
}


start();