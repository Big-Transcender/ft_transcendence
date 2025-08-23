const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '2h',
        });
        // Set JWT in cookie (not httpOnly so frontend can read it) //TODO bruno!!!
        reply.setCookie("token", token, {
            path: "/",
            httpOnly: false,
            secure: false, // set to true if using https
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });
        reply.code(200).send({ message: 'Login Successful', token, user: {id: user.id, name: user.nickname} });
        // reply.status(200).send({ message: 'Login successful', user: { id: user.id, name: user.nickname } });
    });
};
