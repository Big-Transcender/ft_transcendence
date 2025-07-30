const {
    getUserIdByNickname,
    getTournamentByCode,
    createTournament,
    addUserToTournament,
    getTournamentPlayers,
    hasUserJoinedTournament,
    startTournament,
    deleteTournament,
} = require('../dataQuerys');

const repl = require("node:repl");

module.exports = async function (fastify) {
    fastify.post('/create-tournament', async (request, reply) => {
        const { tournamentName } = request.body;

        // Get user info from session
        const sessionUser = request.session.get('user');
        if (!sessionUser) return reply.code(401).send({ error: "Not authenticated" });

        if (!tournamentName) return reply.code(400).send({ error: "Name is empty" });

        const user = getUserIdByNickname(sessionUser.nickname);
        if (!user) return reply.code(404).send({ error: "User not found" });

        const createdAt = new Date().toISOString();

        let code;
        do {
            code = Math.floor(1000 + Math.random() * 9000).toString();
        } while (getTournamentByCode(code));

        const result = createTournament(tournamentName, code, user, createdAt);

        addUserToTournament(result.lastInsertRowid, user);

        reply.code(201).send({
            tournamentId: result.lastInsertRowid,
            tournamentName,
            code,
            message: "Tournament created and user joined",
        });
    });

    fastify.get('/tournament/:code', async (request, reply) => {
        const { code } = request.params;
        if (!code) return reply.code(400).send({ error: "Tournament code is required" });

        const tournament = getTournamentByCode(code);
        if (!tournament) return reply.code(404).send({ error: "Tournament not found" });

        const players = getTournamentPlayers(tournament.id);

        reply.code(200).send({ ...tournament, players });
    });

    fastify.post('/join-tournament', async (request, reply) => {
        const { code } = request.body;

        // Get user info from session
        const sessionUser = request.session.get('user');
        if (!sessionUser)
            return reply.code(401).send({ error: "Not authenticated" });

        if (!code)
            return reply.code(400).send({ error: "Tournament code is required" });

        const user = getUserIdByNickname(sessionUser.nickname);
        if (!user)
            return reply.code(404).send({ error: "User not found" });

        const tournament = getTournamentByCode(code);
        if (!tournament)
            return reply.code(404).send({ error: "Tournament not found" });

        if (hasUserJoinedTournament(tournament.id, user))
            return reply.code(400).send({ error: "User already joined this tournament" });

        addUserToTournament(tournament.id, user);

        reply.code(200).send({
            message: "User successfully joined the tournament",
            tournamentId: tournament.id,
            userId: user,
        });
    });

    fastify.post('/start-tournament', async (request, reply) => {
        const { code } = request.body;

        if (!code)
            return reply.code(400).send({ error: "Tournament code is required" });

        const tournament = getTournamentByCode(code);
        if (!tournament)
            return reply.code(404).send({ error: "Tournament not found" });

        if (tournament.started)
            return reply.code(400).send({ error: "Tournament already started" });
        startTournament(code);
        reply.code(200).send({ message: "Tournament started successfully" });
    });

    fastify.post('/delete-tournament', async (request, reply) =>
    {
        const { code } = request.body;

        if(!code)
            return reply.code(400).send({error: "Tournament code is required"});

        const tournament = getTournamentByCode(code);
        if(!tournament)
            return reply.code(404).send({error: "Tournament doest not exist"});

        if(tournament.started)
            return reply.code(400).send({error: "Cant delete tournament that is active"});

        deleteTournament(code);
        return reply.code(200).send({ message: "Tournament deleted!"})
    })
};
