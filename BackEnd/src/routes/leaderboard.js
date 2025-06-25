const { getLeaderboard, getUserLeaderboardPosition } = require('../dataQuerys');

module.exports = async function (fastify) {
    fastify.get('/leaderboard', async (request, reply) => {
        const leaderBoard = getLeaderboard();
        reply.send(leaderBoard);
    });

    fastify.get('/leaderboard/position/:nickname', async (request, reply) => {
        const { nickname } = request.params;
        const position = getUserLeaderboardPosition(nickname);
        if (!position)
            return reply.code(404).send({ error: "User not found in leaderboard" });
        reply.send({ position });
    });
};
