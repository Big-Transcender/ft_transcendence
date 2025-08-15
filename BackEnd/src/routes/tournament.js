const {
	getUserIdByNickname,
	getTournamentByCode,
	createTournament,
	addUserToTournament,
	getTournamentPlayers,
	hasUserJoinedTournament,
	startTournament,
	deleteTournament,
} = require("../dataQuerys");

const repl = require("node:repl");

module.exports = async function (fastify) {
	fastify.post("/create-tournament", { preHandler: [fastify.authenticate] }, async (request, reply) => {
		const { tournamentName } = request.body;
		const userId = request.userId;

		if (!tournamentName) return reply.code(400).send({ error: "Name is empty" });

		const createdAt = new Date().toISOString();

		let code;
		do {
			code = Math.floor(1000 + Math.random() * 9000).toString();
		} while (getTournamentByCode(code));

		const result = createTournament(tournamentName, code, userId, createdAt);

		addUserToTournament(result.lastInsertRowid, userId);

		reply.code(201).send({
			tournamentId: result.lastInsertRowid,
			tournamentName,
			code,
			message: "Tournament created and user joined",
		});
	});

	fastify.get("/tournament/:code", {preHandler: fastify.authenticate}, async (request, reply) => {
		const { code } = request.params;
		if (!code) return reply.code(400).send({ error: "Tournament code is required" });

		const tournament = getTournamentByCode(code);
		if (!tournament) return reply.code(404).send({ error: "Tournament not found" });

		const players = getTournamentPlayers(tournament.id);

		reply.code(200).send({ ...tournament, players });
	});

	fastify.post("/join-tournament", { preHandler: [fastify.authenticate] }, async (request, reply) => {
		const { code } = request.body;
		const userId = request.userId;

		if (!code)
			return reply.code(400).send({ error: "Tournament code is required" });

		const tournament = getTournamentByCode(code);
		if (!tournament) return reply.code(404).send({ error: "Tournament not found" });

		if (hasUserJoinedTournament(tournament.id, userId)) return reply.code(400).send({ error: "User already joined this tournament" });

		addUserToTournament(tournament.id, userId);

		reply.code(200).send({
			message: "User successfully joined the tournament",
			tournamentId: tournament.id,
			userId: userId,
		});
	});

	fastify.post("/start-tournament", { preHandler: [fastify.authenticate] }, async (request, reply) => {
		const { code } = request.body;

		if (!code) return reply.code(400).send({ error: "Tournament code is required" });

		const tournament = getTournamentByCode(code);
		if (!tournament) return reply.code(404).send({ error: "Tournament not found" });

		if (tournament.started) return reply.code(400).send({ error: "Tournament already started" });
		startTournament(code);
		reply.code(200).send({ message: "Tournament started successfully" });
	});

	fastify.post("/delete-tournament", { preHandler: [fastify.authenticate] }, async (request, reply) => {
		const { code } = request.body;

		if (!code) return reply.code(400).send({ error: "Tournament code is required" });

		const tournament = getTournamentByCode(code);
		if (!tournament) return reply.code(404).send({ error: "Tournament doest not exist" });

		if (tournament.started) return reply.code(400).send({ error: "Cant delete tournament that is active" });

		deleteTournament(code);
		return reply.code(200).send({ message: "Tournament deleted!" });
	});
};
