const db = require("./database");
const { getUserMatchHistory /* other functions */ } = require("./dataQuerys");

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

	fastify.post("/register", async (request, reply) => {
		const { password, email, nickname } = request.body;

		if (!password || !email || !nickname) return reply.code(400).send({ error: "All fields are required" });

		if (!emailRegex.test(email)) return reply.code(400).send({ error: "Invalid email format" });

		if (password.length < 8) return reply.code(400).send({ error: "Password must be at least 8 characters long" });

		if (!/\d/.test(password)) return reply.code(400).send({ error: "Password must have at least 1 number" });

		if (!/[a-z]/.test(password)) return reply.code(400).send({ error: "Password must include at least 1 lower case letter" });

		if (!/[A-Z]/.test(password)) return reply.code(400).send({ error: "Password must include at least 1 upper case letter" });

		if (!/[^A-Za-z0-9]/.test(password)) return reply.code(400).send({ error: "Password must include at least 1 special character" });

		try {
			const nickNameExist = db.prepare("SELECT 1 from USERS WHERE nickname = ?").get(nickname);
			if (nickNameExist) return reply.code(400).send({ error: "Nickname already in use" });

			const emailExist = db.prepare("SELECT 1 FROM USERS where email = ?").get(email);
			if (emailExist) return reply.code(400).send({ error: "Email already in use" });

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
		const { identifier, password } = request.body;

		if (!identifier || !password) return reply.code(400).send({ error: "Identifier and password are required" });

		const user = db.prepare("SELECT * FROM users WHERE nickname = ? OR email = ?").get(identifier, identifier);
		if (!user) return reply.code(401).send({ error: "Invalid credentials", details: "User does not exist" });

		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid) return reply.code(401).send({ error: "Invalid credentials", details: "Wrong password" });
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
	fastify.post("/create-tournament", async (request, reply) => {
		const { nick, tournamentName } = request.body;

		if (!tournamentName) return reply.code(400).send({ error: "Name is empty" });

		if (!nick) return reply.code(400).send({ error: "Nick is empty" });

		// Get user ID from nickname
		const user = db.prepare("SELECT id FROM users WHERE nickname = ?").get(nick);
		if (!user) return reply.code(404).send({ error: "User not found" });

		const createdAt = new Date().toISOString();
		let code;

		// Try until a unique code is generated
		do {
			code = Math.floor(1000 + Math.random() * 9000).toString();
		} while (db.prepare("SELECT 1 FROM tournaments WHERE code = ?").get(code));

		// Insert tournament
		const insert = db.prepare(`
		INSERT INTO tournaments (name, code, created_by, created_at)
		VALUES (?, ?, ?, ?)
	`);
		const result = insert.run(tournamentName, code, user.id, createdAt);

		// Auto-join creator to the tournament
		db.prepare(
			`
		INSERT INTO tournament_players (tournament_id, user_id)
		VALUES (?, ?)
	`
		).run(result.lastInsertRowid, user.id);

		// Respond
		reply.code(201).send({
			tournamentId: result.lastInsertRowid,
			tournamentName,
			code,
			message: "Tournament created and user joined",
		});
	});

	// GET /tournament/:id
	fastify.get("/tournament/:code", async (request, reply) => {
		const { code } = request.params;

		if (!code) return reply.code(400).send({ error: "Tournament code is required" });

		const tournament = db
			.prepare(
				`
			SELECT t.id, t.name, t.code, t.created_at, u.nickname AS created_by
			FROM tournaments t
					 JOIN users u ON t.created_by = u.id
			WHERE t.code = ?
		`
			)
			.get(code);

		if (!tournament) return reply.code(404).send({ error: "Tournament not found" });

		const players = db
			.prepare(
				`
		SELECT u.id, u.nickname
		FROM tournament_players tp
		JOIN users u ON tp.user_id = u.id
		WHERE tp.tournament_id = ?
	`
			)
			.all(tournament.id);

		reply.code(200).send({
			...tournament,
			players,
		});
	});

	fastify.post("/join-tournament", async (request, reply) => {
		const { nick, code } = request.body;

		if (!nick) return reply.code(400).send({ error: "Nick is required" });

		if (!code) return reply.code(400).send({ error: "Tournament code is required" });

		// Check if user exists
		const user = db.prepare("SELECT id FROM users WHERE nickname = ?").get(nick);
		if (!user) return reply.code(404).send({ error: "User not found" });

		// Check if tournament with the given code exists
		const tournament = db.prepare("SELECT id FROM tournaments WHERE code = ?").get(code);
		if (!tournament) return reply.code(404).send({ error: "Tournament not found" });

		// Check if the user is already in the tournament
		const alreadyJoined = db
			.prepare(
				`
		SELECT 1 FROM tournament_players
		WHERE tournament_id = ? AND user_id = ?
	`
			)
			.get(tournament.id, user.id);

		if (alreadyJoined) return reply.code(400).send({ error: "User already joined this tournament" });

		// Add user to tournament
		db.prepare(
			`
		INSERT INTO tournament_players (tournament_id, user_id)
		VALUES (?, ?)
	`
		).run(tournament.id, user.id);

		reply.code(200).send({
			message: "User successfully joined the tournament",
			tournamentId: tournament.id,
			userId: user.id,
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

function addPlayerToTournament(tournamentId, userId) {
	const stmt = db.prepare(`INSERT OR IGNORE INTO tournament_players (tournament_id, user_id) VALUES (?, ?)`);
	stmt.run(tournamentId, userId);
}

module.exports = routes;
