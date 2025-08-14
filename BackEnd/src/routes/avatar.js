const { pipeline } = require('node:stream/promises')
const fs = require('fs')
const path = require('path')

module.exports = async function (fastify) {

    fastify.addContentTypeParser(['image/jpeg', 'image/png'], { parseAs: 'buffer' }, function (req, body, done) {
        done(null, body)
    });

    fastify.post('/avatar', async function (request, reply) {
        const data = await request.file()
        const filename = 'test_avatar.jpg'
        const filepath = path.join(__dirname, '../../uploads', filename)
        await pipeline(data.file, fs.createWriteStream(filepath))
        reply.send({ success: true, filename })
    });
}