const db = require('../database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Frontend base URL used to build absolute URL for default assets
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

module.exports = async function (fastify) {
    fastify.get('/users', async (request, reply) => {
        const users = db.prepare('SELECT id, nickname FROM users').all();
        reply.send(users);
    });

    fastify.post('/switch-nickname',{ preHandler: fastify.authenticate }, async (request, reply) => {
        const newNickname = request.body.nickname;
        const userId = request.userId;

        console.log("id", userId);

        if (!newNickname) {
            return reply.code(400).send({ error: "Nickname is required" });
        }

        const nickExists = db.prepare("SELECT 1 FROM users WHERE nickname = ?").get(newNickname);
        if (nickExists) {
            return reply.code(400).send({ error: "Nickname already in use" });
        }

        try {
            await db.prepare('UPDATE users SET nickname = ? WHERE id = ?').run(newNickname, userId);
            return reply.send({ success: true });
        } catch (err) {
            return reply.code(500).send({ error: "Database error" });
        }
    });

    fastify.post('/switch-email', { preHandler: fastify.authenticate }, async (request, reply) => {
        const newEmail = request.body.email;
        const userId = request.userId;

        if(!newEmail)
            return reply.code(400).send({ error: "Email is required" });

        const emailExists = db.prepare('SELECT 1 FROM users WHERE email = ?').get(newEmail);
        if(emailExists)
            return reply.code(400).send({ error: "Email already in use" });

        try
        {
            await db.prepare('UPDATE users SET email = ? WHERE id = ?').run(newEmail, userId);
            return reply.send({ success: true});
        } catch (err) {
            return reply.code(500).send({ error: "Database error"});
        }
    })

    fastify.post('/switch-password', { preHandler: fastify.authenticate }, async (request, reply) => {
        const oldPassowrd = request.body;
        const newPassword = request.body;
        const userId = request.userId;

        if(!oldPassowrd)
            return reply.code(400).send({ error: "Old password id required" });

        if(!newPassword)
            return reply.code(400).send({ error: "New password is required" });

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        const isValid = await bcrypt.compare(oldPassowrd, user.password);
        if(!isValid)
            return reply.code(401).send({ error: 'Wrong password' });

        await db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, userId);
        return reply.send({ success: true});
    });

    fastify.get('/me/avatar', { preHandler: fastify.authenticate }, async (request, reply) => {
        const userId = request.userId;
        const user = db.prepare('SELECT avatar FROM users WHERE id = ?').get(userId);

        // Build default avatar as an absolute URL to the frontend asset
        const defaultAvatar = `${FRONTEND_URL}/images/pongGame/player1.png`;
        let avatarPath = defaultAvatar;

        if (user && user.avatar) {
            // Prefer uploaded avatar when it exists on disk
            const uploadsDir = process.env.UPLOADS_DIR || '/app/uploads';
            const filePath = path.join(uploadsDir, user.avatar);
            if (fs.existsSync(filePath)) {
                avatarPath = `/uploads/${user.avatar}`; // served by backend static
            }
        }

        reply.send({ avatar: avatarPath });
    });
};
