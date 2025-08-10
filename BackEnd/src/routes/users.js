const db = require('../database');

module.exports = async function (fastify) {
    fastify.get('/users', async (request, reply) => {
        const users = db.prepare('SELECT id, nickname FROM users').all();
        reply.send(users);
    });

    fastify.post('/switch-nickname', async (request, reply) => {
        const newNickname = request.body;
        const userId = request.userId;

        await db.prepare('UPDATE users SET nickname = ? WHERE id = ?').run(newNickname, userId);
        return reply.send({ success: true});
    })
};