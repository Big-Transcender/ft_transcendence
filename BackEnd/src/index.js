const fastify = require("fastify")({ logger: false, trustProxy: true });
const cors = require("@fastify/cors");
const path = require("path");
const fs = require("fs");
const fastifyPassport = require("@fastify/passport");
const fastifySecureSession = require("@fastify/secure-session");
const fastifyStatic = require("@fastify/static");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const fastifyMultipart = require("@fastify/multipart");
const bcrypt = require("bcryptjs");

const db = require("./database");

const { setupUnifiedWebSocket } = require("./wsManager");

dotenv.config();

fastify.register(fastifySecureSession, {
	key: fs.readFileSync(path.join(__dirname, "not-so-secret-key")),
	cookie: {
		path: "/", // Make sure path is set
		// httpOnly: true,
		secure: true, // TODO change to true when we start using https
		sameSite: "strict", // or 'strict' depending on your setup
	},
});

fastify.register(fastifyPassport.initialize());
fastify.register(fastifyPassport.secureSession());
fastify.register(require('@fastify/multipart'), {
	limits: {
		fileSize: 10 * 1024 * 1024 // 10 MB
	}
});



fastifyPassport.registerUserDeserializer(async (user, req) => {
	return user;
});
fastifyPassport.registerUserSerializer(async (user, req) => {
	return user;
});





fastify.decorate("authenticate", async function (request, reply) {
	try {
		const authHeader = request.headers.authorization;
		if (!authHeader) {
			return reply.code(401).send({ error: "Access denied" });
		}
		const token = authHeader.split(" ")[1]; // if using "Bearer <token>"
		const decoded = jwt.verify(token, process.env.JWT_SECRET); 
		request.userId = decoded.userId;
		const user = db.prepare("SELECT nickname FROM users WHERE id = ?").get(decoded.userId);
		request.userNickname = user.nickname;
	} catch (err) {
		reply.code(401).send({ error: "Invalid token" });
	}
});

fastify.get("/logout", async (req, res) => {
	req.logout();
	req.session.delete();
	res.clearCookie("session", { path: "/" });
	res.clearCookie("token", { path: "/" });

	return res.send({ success: true });
});

fastify.get("/me", async (request, reply) => {
	const token = request.cookies?.token || (request.headers.authorization && request.headers.authorization.split(" ")[1]);

	if(!token)
		return reply.status(401).send({ error: "Not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    request.userId = decoded.userId;
    const user = db.prepare("SELECT id, nickname FROM users WHERE id = ?").get(decoded.userId);
    request.session.set('user', { id: user.id, nickname: user.nickname });
    sessionUser = request.session.get('user');

	if (sessionUser)
		return { user: sessionUser.user, sessionUser: sessionUser };
	else
		return reply.status(401).send({ error: "Not logged in" });

});

async function registerRoutes() {
	const routesDir = path.join(__dirname, "routes");
	const files = fs.readdirSync(routesDir).filter((file) => file.endsWith(".js"));

	for (const file of files) {
		const route = require(path.join(routesDir, file));
		await route(fastify); // each route file is a function that registers routes on fastify
	}
}

async function start() {
	try {
		await fastify.register(require("@fastify/cors"), {
			origin: (origin, cb) => {
				//console.log("Incoming Origin:", origin);
				if (!origin) return cb(null, true);
				const allowedPattern = /^https?:\/\/(10\.11\.\d+\.\d+|c\d+r\d+s\d+\.42porto\.com|localhost:5173|172\.30\.94\.112:5173)(:\d+)?$/;
				if (allowedPattern.test(origin)) cb(null, origin);
				else cb(null, false);
			},
			credentials: true,
			methods: ["GET", "POST", "PUT", "PATCH", "UPDATE", "DELETE", "OPTIONS"],
		});

		// Dynamically register all route files
		await registerRoutes();

		// Register static file serving for /uploads ONLY
		fastify.register(fastifyStatic, {
			root: process.env.UPLOADS_DIR || '/app/uploads',
			prefix: '/uploads/',
		});

		await fastify.listen({ port: 3000, host: "0.0.0.0" });
		console.log("✅ Server started at http://localhost:3000");

		// Setup Server WebSocket connection
		setupUnifiedWebSocket(fastify.server);
	} catch (error) {
		console.error("❌ Failed to start:", error);
		process.exit(1);
	}
}

start();
