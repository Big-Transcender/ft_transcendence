const db = require('../database');

module.exports = async function (fastify) {
    fastify.get('/users', async (request, reply) => {
        const users = db.prepare('SELECT id, nickname FROM users').all();
        reply.send(users);
    });
};
