const { pipeline } = require('node:stream/promises')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken');
const db = require('../database');

module.exports = async function (fastify) {

    fastify.addContentTypeParser(['image/jpeg', 'image/png'], { parseAs: 'buffer' }, function (req, body, done) {
        done(null, body)
    });

    fastify.post('/avatar', { preHandler: fastify.authenticate }, async function (request, reply) {
        const data = await request.file();
        const userId = request.userId;
        const filename = `${userId}_avatar.jpg`;
        // Always use /app/uploads inside the container (matches Docker volume)
        const uploadsDir = process.env.UPLOADS_DIR || '/app/uploads';
        const filepath = path.join(uploadsDir, filename);
        fastify.log.info(`Saving avatar to: ${filepath}`);
        try {
            await pipeline(data.file, fs.createWriteStream(filepath));
            fastify.log.info(`Avatar saved: ${filepath}`);
            db.updateUserAvatar(userId, filename);
            reply.send({ success: true, filename, url: `/uploads/${filename}` });
        } catch (err) {
            fastify.log.error(`Failed to save avatar: ${err}`);
            reply.code(500).send({ success: false, error: 'Failed to save avatar' });
        }
    });
}