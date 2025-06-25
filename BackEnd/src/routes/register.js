const db = require("../database");
const bcrypt = require("bcryptjs");
const { validateRegistration } = require("../utils/validators");

async function registerRoutes(fastify) {
    fastify.post("/register", async (request, reply) => {
        const { password, email, nickname } = request.body;

        const validationError = validateRegistration({ password, email, nickname });
        if (validationError) return reply.code(400).send({ error: validationError });

        try {
            const nickExists = db.prepare("SELECT 1 FROM users WHERE nickname = ?").get(nickname);
            if (nickExists) return reply.code(400).send({ error: "Nickname already in use" });

            const emailExists = db.prepare("SELECT 1 FROM users WHERE email = ?").get(email);
            if (emailExists) return reply.code(400).send({ error: "Email already in use" });

            const hashedPassword = await bcrypt.hash(password, 10);
            const info = db.prepare("INSERT INTO users (nickname, password, email) VALUES (?, ?, ?)").run(nickname, hashedPassword, email);

            reply.code(201).send({ id: info.lastInsertRowid });
        } catch (err) {
            reply.code(500).send({ error: "Could not register user", details: err.message });
        }
    });
}

module.exports = registerRoutes;
