const db = require("./database");
const bcrypt = require("bcryptjs");

async function routes(fastify) {
	// Get /home
	fastify.get("/", async (request, reply) => {
		return { message: "Hello Bitches!!!" };
	});

	// POST /register
	fastify.post("/register", async (request, reply) => {
		const { name, password, email, nickname } = request.body;

		if (!name || !password || !email || !nickname) {
			return reply.code(400).send({ error: "All fields are required", details: "Missing field" });
		}

		try {
			const hashedPassword = await bcrypt.hash(password, 10);
			const stmt = db.prepare("INSERT INTO users (name, password, email, nickname) VALUES (?, ?, ?, ?)");
			const info = stmt.run(name, hashedPassword, email, nickname);
			reply.code(201).send({ id: info.lastInsertRowid });
		} catch (err) {
			reply.code(400).send({ error: "Could not register user", details: err.message });
		}
	});

	// POST /login
	fastify.post("/login", async (request, reply) => {
		const { name, password } = request.body;

		if (!name || !password) {
			return reply.code(400).send({ error: "Name and password are required" });
		}

		const user = db.prepare("SELECT * FROM users WHERE name = ?").get(name);

		if (!user) {
			return reply.code(401).send({ error: "Invalid credentials" });
		}

		const isValid = await bcrypt.compare(password, user.password);

		if (!isValid) {
			return reply.code(401).send({ error: "Invalid credentials" });
		}

		reply.send({ message: "Login successful", user: { id: user.id, name: user.name } });
	});

	// GET /users
	fastify.get("/users", async (request, reply) => {
		const users = db.prepare("SELECT id, nickname FROM users").all();
		reply.send(users);
	});
}

module.exports = routes;
