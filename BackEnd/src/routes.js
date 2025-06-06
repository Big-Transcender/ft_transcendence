const db = require("./database");
const { getUserMatchHistory, /* other functions */ } = require('./dataQuerys');

const bcrypt = require("bcryptjs");

const { getLeaderboard } = require("./dataQuerys");
const repl = require("node:repl");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function routes(fastify) {
	fastify.decorate("tournaments", {});

	// Get /home

	fastify.get("/", async (request, reply) => {
		return { message: "Hello Bitches!!!" };
	});

	// POST /register

	fastify.post("/register", async (request, reply) =>
	{
		const { password, email, nickname } = request.body;

		if (!password || !email || !nickname)
			return reply.code(400).send({ error: "All fields are required"});

		if(!emailRegex.test(email))
			return reply.code(400).send({error: "Invalid email format"})

		if(password.length < 8)
			return reply.code(400).send({error: "Password must be at least 8 characters long"})

		if(!/\d/.test(password))
			return reply.code(400).send({error: "Password must have at least 1 number"})

		if(!/[a-z]/.test(password))
			return reply.code(400).send({error: "Password must include at least 1 lower case letter"})

		if(!/[A-Z]/.test(password))
			return reply.code(400).send({error: "Password must include at least 1 upper case letter"})

		if(!/[^A-Za-z0-9]/.test(password))
			return reply.code(400).send({error: "Password must include at least 1 special character"})

		try
		{
			const nickNameExist = db.prepare("SELECT 1 from USERS WHERE nickname = ?").get(nickname)
			if(nickNameExist)
				return reply.code(400).send({error: "Nickname already in use"})

			const emailExist = db.prepare("SELECT 1 FROM USERS where email = ?").get(email)
			if(emailExist)
				return reply.code(400).send({error: "Email already in use"})

			const hashedPassword = await bcrypt.hash(password, 10);
			const stmt = db.prepare("INSERT INTO users (nickname, password, email) VALUES (?, ?, ?)");
			const info = stmt.run(nickname, hashedPassword, email);

			reply.code(201).send({ id: info.lastInsertRowid });
		} catch (err) {
			reply.code(400).send({ error: "Could not register user", details: err.message });
		}
	});

	// POST /login

	fastify.post("/login", async (request, reply) =>
	{
		const { identifier, password } = request.body;

		if (!identifier || !password)
			return reply.code(400).send({ error: "Identifier and password are required" });

		const user = db.prepare("SELECT * FROM users WHERE nickname = ? OR email = ?").get(identifier, identifier);
		if (!user)
			return reply.code(401).send({ error: "Invalid credentials", details: "User does not exist" });

		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid)
			return reply.code(401).send({ error: "Invalid credentials", details: "Wrong password" });
		reply.send({ message: "Login successful", user: { id: user.id, name: user.nickname } });
	});

	// GET /users

	fastify.get("/users", async (request, reply) =>
	{
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
	fastify.post("/create-tournament", async (request, reply) => {
		const { nick, tournamentName } = request.body;

		if (!tournamentName)
			return reply.code(400).send({ error: "Name is empty" });
		if (!nick)
			return reply.code(400).send({ error: "Nick is empty" });

		// Check if the user exists
		const user = db.prepare("SELECT id FROM users WHERE nickname = ?").get(nick);
		if (!user)
			return reply.code(404).send({ error: "User not found in database" });

		const createdAt = new Date().toISOString();
		let code;
		let exists;
		do {
			code = Math.floor(1000 + Math.random() * 9000).toString();
			exists = db.prepare("SELECT 1 FROM tournaments WHERE code = ?").get(code);
		} while (exists);

		// Call createTournament with correct order and proper user ID
		const info = createTournament(tournamentName, code, user.id, createdAt);

		reply.code(201).send({
			tournamentId: info.lastInsertRowid,  // use inserted row id here
			tournamentName,
			message: "Tournament created",
		});
	});

	// GET /tournament/:id
	fastify.get("/tournament/:id", async (request, reply) =>
	{
		const { id } = request.params;
		const tournament = fastify.tournaments[id];

		if (!tournament)
			return reply.code(404).send({ error: "Tournament not found" });
		reply.send(tournament);
	});

	// GET /tournament/:id/match/:matchId
	fastify.get("/tournament/:id/match/:matchId", async (request, reply) =>
	{
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

	//ONLY FOR TESTING API
	fastify.delete("/test-cleanup", async (request, reply) => {
		try {
			const stmt = db.prepare("DELETE FROM users WHERE email = ?");
			const info = stmt.run("validuser@example.com");
			return reply.send({ deleted: info.changes });
		} catch (err) {
			return reply.code(500).send({ error: "Cleanup failed", details: err.message });
		}
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

function createTournament(name, code, createdBy, createdAt) {
	const stmt = db.prepare(`INSERT INTO tournaments (name, code, created_by, created_at) VALUES (?, ?, ?, ?)`);
	return stmt.run(name, code, createdBy, createdAt);
}

function insertMatch(player1Id, player2Id, winnerId, scoreP1, scoreP2, tournamentId = null) {
	const stmt = db.prepare(`
    INSERT INTO matches (player1_id, player2_id, winner_id, score_p1, score_p2, tournament_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
	return stmt.run(player1Id, player2Id, winnerId, scoreP1, scoreP2, tournamentId);
}

function getTournamentMatches(tournamentId) {
	const stmt = db.prepare(`
    SELECT * FROM matches WHERE tournament_id = ? ORDER BY timestamp DESC
  `);
	return stmt.all(tournamentId);
}


module.exports = routes;