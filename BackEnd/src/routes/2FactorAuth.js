const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const { saveSecret, getSecret, setUser2FAStatus } = require("../dataQuerys");

module.exports = async function (fastify) {
    fastify.get("/2fa/setup", async (request, reply) => {
        const secret = speakeasy.generateSecret({
            name: "TranscendenceApp",
        });

        const userId = request.session.user.id;
        await saveSecret(userId, secret.base32);

        const qrDataUrl = qrcode.toDataURL(secret.otpauth_url);

        return {qr: qrDataUrl, secret: secret.base32};
    });

    fastify.post("/2fa/verify", async (request, reply) => {
        const { token } = request.body;
        const userId = request.session.user.id;
        const secret = await getSecret(userId);

        const verified = speakeasy.totp.verify({
            secret,
            encoding: "base32",
            token,
            window: 1,
        });

        if(verified) {
            await setUser2FAStatus(userId, true);
            reply.send({success: true});
        } else {
            reply.status(401).send({ success:false, message: "Invalid token"});
        }
    });
}