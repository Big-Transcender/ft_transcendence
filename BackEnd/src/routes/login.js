const db = require('../database');  // adjust path as needed
const bcrypt = require('bcryptjs');

module.exports = async function (fastify) {
    fastify.post('/login', async (request, reply) => {
        const { identifier, password } = request.body;

        if (!identifier || !password)
            return reply.code(400).send({ error: 'All fields are required' });

        const user = db
            .prepare('SELECT * FROM users WHERE nickname = ? OR email = ?')
            .get(identifier, identifier);

        if (!user)
            return reply
                .code(401)
                .send({ error: 'User does not exist', details: 'User does not exist' });

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid)
            return reply
                .code(401)
                .send({ error: 'Wrong password', details: 'Wrong password' });

        if(user.two_factor_enabled)
        {
            request.session.set('temp_user', {id: user.id, nickname: user.nickname })
            return reply.send({message: 'Two-Factor Enable'});
        }
        request.session.set('user', { id: user.id, nickname: user.nickname });

        reply.send({ message: 'Login successful', user: { id: user.id, name: user.nickname } });
    });
};
