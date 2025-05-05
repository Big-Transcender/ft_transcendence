const bcrypt = require('bcryptjs');

const red = '\\x1b[31m';
const green = '\\x1b[32m';
const reset = '\\x1b[0m';

async function routes(fastify, options)
{
	// Your existing routes go here...
	fastify.post('/register', async (request, reply) => {
		const {username, password} = request.body;

		if (!username || !password)
			return reply.status(400).send({ error: 'Username and password are required' });


		const hashedPassword = await bcrypt.hash(password, 10);
	
		await fastify.sqlite.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
		console.log("USER:			" + username);
		console.log("PASS:			"+ password);	
		return reply.status(201).send({ message: 'User registered successfully' });
	})

	// Add this to your routes.js

	fastify.get('/users', async (request, reply) => {
	try {
		const users = await fastify.sqlite.all('SELECT * FROM users');
		console.log("USERS:			" + users)
		return reply.status(200).send({ users });
	} catch (err) {
		console.error(err);
		return reply.status(500).send({ error: 'Failed to retrieve users' });
	}
	});
  

		
}

module.exports = routes;
