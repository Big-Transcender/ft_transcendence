const db = require("./database");
const bcrypt = require("bcryptjs");

const { matches, createMatch } = require('./gameLoop');
const { createInitialGameState, handleInput } = require('./gameLogic');

const { getLeaderboard, getUserLeaderboardPosition} = require("./dataQuerys");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function routes(fastify) {
	fastify.decorate("tournaments", {});

	// Get /home

	fastify.get("/", async (request, reply) => {
		return { message: "Hello Bitches!!!" };
	});

	fastify.post("/register", async (request, reply) =>
	{
		const { password, email, nickname } = request.body;

		if (!password || !email || !nickname) return reply.code(400).send({ error: "All fields are required" });

		if (!emailRegex.test(email)) return reply.code(400).send({ error: "Invalid email format" });

		if (password.length < 8) return reply.code(400).send({ error: "Password 8 long" });

		if (!/\d/.test(password)) return reply.code(400).send({ error: "Password 1 number" });

		if (!/[a-z]/.test(password)) return reply.code(400).send({ error: "Password lower case" });

		if (!/[A-Z]/.test(password)) return reply.code(400).send({ error: "Password uper case" });

		if (!/[^A-Za-z0-9]/.test(password)) return reply.code(400).send({ error: "Password special character" });

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

		if (!identifier || !password) return reply.code(400).send({ error: "All fields are required" });

		const user = db.prepare("SELECT * FROM users WHERE nickname = ? OR email = ?").get(identifier, identifier);
		if (!user) return reply.code(401).send({ error: "User does not exist", details: "User does not exist" });

		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid) return reply.code(401).send({ error: "Wrong password", details: "Wrong password" });
		reply.send({ message: "Login successful", user: { id: user.id, name: user.nickname } });
	});

	// GET /users

	fastify.get("/users", async (request, reply) => {
		const users = db.prepare("SELECT id, nickname FROM users").all();

		reply.send(users);
	});

	fastify.get("/leaderboard", async (request, reply) => {
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

		const alreadyJoined = db
			.prepare(
				`
		SELECT 1 FROM tournament_players
		WHERE tournament_id = ? AND user_id = ?
	`
			)
			.get(tournament.id, user.id);

		if (alreadyJoined) return reply.code(400).send({ error: "User already joined this tournament" });

		db.prepare(
			`
		INSERT INTO tournament_players (tournament_id, user_id)
		VALUES (?, ?)
	`
		).run(tournament.id, user.id);

		reply.code(200).send({
			message: "User successfully joined the tournament",
			tournamentId: tournament.id,
			userId: user.id
		});
	});

	fastify.post("/start-tournament", async (request, reply) => {
		const { code } = request.body;

		if (!code)
			return reply.code(400).send({ error: "Tournament code is required" });

		const tournament = db.prepare("SELECT * FROM tournaments WHERE code = ?").get(code);
		if (!tournament)
			return reply.code(404).send({ error: "Tournament not found" });

		if (tournament.started)
			return reply.code(400).send({ error: "Tournament already started" });

		db.prepare("UPDATE tournaments SET started = 1 WHERE code = ?").run(code);

		reply.code(200).send({ message: "Tournament started successfully" });
	});

	fastify.get("/leaderBoard", async (request, reply) => {
		const leaderBoard = getLeaderboard();
		reply.send(leaderBoard);
	});

	fastify.get("/leaderboard/position/:userId", async (request, reply) => {
		const { userId } = request.params;
		const position = getUserLeaderboardPosition(Number(userId));
		if (!position)
			return reply.code(404).send({ error: "User not found in leaderboard" });
		reply.send({ position });
	});
	fastify.delete("/test-cleanup", async (request, reply) => {
		try {
			const stmt = db.prepare("DELETE FROM users WHERE email = ?");
			const info = stmt.run("validuser@example.com");
			return reply.send({ deleted: info.changes });
		} catch (err) {
			return reply.code(500).send({ error: "Cleanup failed", details: err.message });
		}
	});

	// Create a new Pong game
	fastify.post('/pong/game', async (request, reply) => {
		const matchId = "match-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
		createMatch(matchId, createInitialGameState);
		return { matchId };
	});

	// Send player input
	fastify.post('/pong/game/:matchId/input', async (request, reply) => {
		const { matchId } = request.params;
		const { playerId, keys } = request.body;
		const match = matches.get(matchId);
		if (!match)
			return reply.code(404).send({ error: "Match not found" });
		handleInput(match.gameState, playerId, keys);
		return { ok: true };
	});

	// Get game state
	fastify.get('/pong/game/:matchId/state', async (request, reply) => {
		const { matchId } = request.params;
		const match = matches.get(matchId);
		if (!match)
			return reply.code(404).send({ error: "Match not found" });
		return match.gameState;
	});

}

module.exports = routes;
