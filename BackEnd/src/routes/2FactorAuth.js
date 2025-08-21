const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const db = require("../database");
const { saveSecret, getSecret, setUser2FAStatus } = require("../dataQuerys");

module.exports = async function (fastify) {
	fastify.post("/2fa/setup", { preHandler: [fastify.authenticate] }, async (request, reply) => {
		const userId = request.userId;

		const alreadyEnable = await db.prepare("SELECT two_factor_enable FROM users WHERE id = ?").get(userId);
		if (alreadyEnable && alreadyEnable.two_factor_enable === 1) return reply.code(400).send({ error: "2FA is already enabled" });

		const secret = speakeasy.generateSecret({
			name: `Transcendence(User ${userId})`,
		});

		await db.prepare("UPDATE users SET two_factor_secret = ? WHERE id = ?").run(secret.base32, userId);

		const qrCode = await qrcode.toDataURL(secret.otpauth_url);
		return reply.send({ qr: qrCode });
	});

	//route for verifying 2FA token
	fastify.post("/2fa/verify", { preHandler: [fastify.authenticate] }, async (request, reply) => {
		const { token } = request.body;
		const userId = request.userId;

		if (!token) return reply.code(400).send({ error: "Token is required" });

		const row = await db.prepare("SELECT two_factor_secret FROM users WHERE id = ?").get(userId);
		console.log(userId);

		console.log(row, row.two_factor_secret);
		if (!row || !row.two_factor_secret) return reply.code(400).send({ error: "No 2FA setup not found" });

		const verified = speakeasy.totp.verify({
			secret: row.two_factor_secret,
			encoding: "base32",
			token,
		});

		if (!verified) return reply.code(400).send({ error: "Invalid token" });

		await db.prepare("UPDATE users SET two_factor_enable = 1 WHERE id = ?").run(userId);
		return reply.send({ success: true });
	});

	fastify.get("/2fa/status", { preHandler: [fastify.authenticate] }, async (request, reply) => {
		const userId = request.userId;

		const row = await db.prepare("SELECT two_factor_enable FROM users WHERE id = ?").get(userId);
		const enabled = row && row.two_factor_enable === 1;
		return reply.send({ enabled });
	});

	fastify.post("/2fa/disable", { preHandler: [fastify.authenticate] }, async (request, reply) => {
		const { token } = request.body;
		const userId = request.userId;

		if (!token) return reply.code(400).send({ error: "Token is required" });

		const row = db.prepare("SELECT two_factor_secret FROM users WHERE id = ?").get(userId);
		if (!row || !row.two_factor_secret) return reply.code(400).send({ error: "2FA not set up" });

		const verified = speakeasy.totp.verify({
			secret: row.two_factor_secret,
			encoding: "base32",
			token,
		});

		if (!verified) return reply.code(400).send({ error: "Invalid token " });

		await db.prepare("UPDATE users SET two_factor_enable = 0, two_factor_secret = NULL WHERE id = ?").run(userId);

		return reply.send({ success: true });
	});
};
