const { getPlayerStats } = require('../dataQuerys');

module.exports = async function (fastify) {
    fastify.get('/player-stats/:nickname', async (request, reply) => {
        const { nickname } = request.params;
        const stats = getPlayerStats(nickname);

        if (!stats) return reply.code(404).send({ error: 'User not found' });
        reply.send(stats);
    });
};
