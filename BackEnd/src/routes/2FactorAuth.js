const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const db = require('../database');
const { saveSecret, getSecret, setUser2FAStatus } = require("../dataQuerys");

//route for setting up 2FA
module.exports = async function (fastify) {
	fastify.post('/2fa/setup', async (request, reply) => {
		const user = request.session.get('user');
		console.log("hello");
		if (!user)
			return reply.code(401).send({ error: 'Not authenticated' });

		const secret = speakeasy.generateSecret({
			name: `Transcendence(${user.nickname})`
		});

		await db.prepare('UPDATE users SET two_factor_secret = ? WHERE id = ?')
			.run(secret.base32, user.id);

		const qrCode = await qrcode.toDataURL(secret.otpauth_url);
		return reply.send({ qr: qrCode, secret: secret.base32 });
	});

//route for verifying 2FA token
	fastify.post('/2fa/verify', async (request, reply) => {
		const { token } = request.body;
		const user = request.session.get('user');

		const row = await db.prepare('SELECT two_factor_secret FROM users WHERE id = ?').get(user.id);

		const verified = speakeasy.totp.verify({
			secret: row.two_factor_secret,
			encoding: 'base32',
			token
		});

		if (!verified)
			return reply.code(400).send({ error: 'Invalid token' });

		await db.prepare('UPDATE users SET two_factor_enable = 1 WHERE id = ?').run(user.id);

		return reply.send({ success: true });
	});
};
