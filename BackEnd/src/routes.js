const db = require("./database");

const bcrypt = require("bcryptjs");

const { getLeaderboard } = require("./dataQuerys");

async function routes(fastify) {
	fastify.decorate("tournaments", {});

	// Get /home

	fastify.get("/", async (request, reply) => {
		return { message: "Hello Bitches!!!" };
	});

	// POST /register

	fastify.post("/register", async (request, reply) => {
		const { password, email, nickname } = request.body;

		if (!password || !email || !nickname) {
			return reply.code(400).send({ error: "All fields are required", details: "Missing field" });
		}

		try {
			const hashedPassword = await bcrypt.hash(password, 10);

			const stmt = db.prepare("INSERT INTO users (nickname, password, email) VALUES (?, ?, ?)");

			const info = stmt.run(nickname, hashedPassword, email);

			reply.code(201).send({ id: info.lastInsertRowid });
		} catch (err) {
			reply.code(400).send({ error: "Could not register user", details: err.message });
		}
	});

	// POST /login

	fastify.post("/login", async (request, reply) => {
		const { nickname, password } = request.body;

		console.log("nickname: " + nickname);

		console.log("pass: " + password);

		if (!nickname || !password) {
			return reply.code(400).send({ error: "Name and password are required" });
		}

		const user = db.prepare("SELECT * FROM users WHERE nickname = ?").get(nickname);

		if (!user) {
			return reply.code(401).send({ error: "Invalid credentials", details: "User dont exist" });
		}

		const isValid = await bcrypt.compare(password, user.password);

		if (!isValid) {
			return reply.code(401).send({ error: "Invalid credentials", details: "Wrong password" });
		}

		reply.send({ message: "Login successful", user: { id: user.id, name: user.nickname } });
	});

	// GET /users

	fastify.get("/users", async (request, reply) => {
		const users = db.prepare("SELECT id, nickname FROM users").all();

		reply.send(users);
	});

	// GET /leaderBoard

	// GET /leaderBoard
	fastify.get("/leaderBoard", async (request, reply) => {
		const leaderBoard = getLeaderboard();

		reply.send(leaderBoard);
	});

	// POST /tournament
	fastify.post("/tournament", async (request, reply) => {
		const { name, players } = request.body;

		if (!name || !Array.isArray(players) || players.length < 4) {
			return reply.code(400).send({ error: "Invalid tournament data" });
		}

		const id = Date.now().toString(); // unique ID
		const matches = generateMatches(players);

		fastify.tournaments[id] = {
			id,
			name,
			players,
			matches,
			currentMatchIndex: 0,
			status: "pending",
		};

		reply.code(201).send({
			tournamentId: id,
			message: "Tournament created",
			tournament: fastify.tournaments[id],
		});
	});

	// GET /tournament/:id
	fastify.get("/tournament/:id", async (request, reply) => {
		const { id } = request.params;
		const tournament = fastify.tournaments[id];

		if (!tournament) {
			return reply.code(404).send({ error: "Tournament not found" });
		}

		reply.send(tournament);
	});

	// GET /tournament/:id/match/:matchId
	fastify.get("/tournament/:id/match/:matchId", async (request, reply) => {
		const { id, matchId } = request.params;
		const tournament = fastify.tournaments[id];

		if (!tournament) {
			return reply.code(404).send({ error: "Tournament not found" });
		}

		const match = tournament.matches.find((m) => m.id === matchId);

		if (!match) {
			return reply.code(404).send({ error: "Match not found" });
		}

		reply.send({
			matchId: match.id,
			p1: match.p1,
			p2: match.p2,
			winner: match.winner,
		});
	});
}

function generateMatches(players) {
	const matches = [];
	const shuffled = [...players].sort(() => Math.random() - 0.5);
	let matchCounter = 0;

	for (let i = 0; i < shuffled.length; i += 2) {
		matches.push({
			id: `match-${matchCounter++}`,
			p1: shuffled[i],
			p2: shuffled[i + 1] || null, // handle odd number
			winner: null,
		});
	}

	// Fill in placeholders for future rounds (if needed)
	let rounds = Math.ceil(Math.log2(players.length));
	let totalMatches = Math.pow(2, rounds) - 1;

	while (matches.length < totalMatches) {
		matches.push({
			id: `match-${matchCounter++}`,
			p1: null,
			p2: null,
			winner: null,
		});
	}

	return matches;
}

module.exports = routes;
