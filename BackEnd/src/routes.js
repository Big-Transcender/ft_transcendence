const db = require('./database');
const bcrypt = require('bcryptjs');

async function routes(fastify) {

	// Get /home
	fastify.get('/', async (request, reply) => {
		return { message: 'Hello Bitches!!!' };
	  });

	// POST /register
	fastify.post('/register', async (request, reply) => {
		const { password, email, nickname } = request.body;

		if (!password || !email || !nickname)
			return reply.code(400).send({ error: 'All fields are required' });

		try
		{
			const hashedPassword = await bcrypt.hash(password, 10); 
			const stmt = db.prepare('INSERT INTO users (nickname, password, email) VALUES (?, ?, ?)');
			const info = stmt.run(nickname, hashedPassword, email);
			reply.code(201).send({ id: info.lastInsertRowid });
		}
		catch (err)
		{
			reply.code(400).send({ error: 'Could not register user', details: err.message });
		}
	});

	// POST /login
	fastify.post('/login', async (request, reply) => {
		const { nickname, password } = request.body;
	
		if (!nickname || !password) {
		  return reply.code(400).send({ error: 'Name and password are required' });
		}
	
		const user = db.prepare('SELECT * FROM users WHERE nickname = ?').get(nickname);
	
		if (!user) {
		  return reply.code(401).send({ error: 'Invalid credentials' });
		}
	
		const isValid = await bcrypt.compare(password, user.password);
	
		if (!isValid) {
		  return reply.code(401).send({ error: 'Invalid credentials' });
		}
	
		reply.send({ message: 'Login successful', user: { id: user.id, name: user.nickname } });
	  });


	// GET /users
	fastify.get('/users', async (request, reply) => {
		const users = db.prepare('SELECT id, nickname FROM users').all(); 
		reply.send(users);
	});
}

module.exports = routes;

