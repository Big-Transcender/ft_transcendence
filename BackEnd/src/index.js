const fastify = require("fastify")({ logger: true});
const cors = require("@fastify/cors");
const path = require("path");
const fs = require("fs");
const fastifyPassport = require("@fastify/passport");
const fastifySecureSession = require("@fastify/secure-session");
const fastifyStatic = require("@fastify/static");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken')
const fastifyMultipart = require('@fastify/multipart')

const db = require("./database");

const { setupUnifiedWebSocket } = require("./wsManager");

dotenv.config();

fastify.register(fastifySecureSession, {
	key: fs.readFileSync(path.join(__dirname, "not-so-secret-key")),
	cookie: {
		path: "/", // Make sure path is set
		httpOnly: true,
		secure: false, // TODO change to true when we start using https
		sameSite: "lax", // or 'strict' depending on your setup
	},
});

fastify.register(fastifyPassport.initialize());
fastify.register(fastifyPassport.secureSession());
fastify.register(fastifyMultipart);

fastifyPassport.use(
	"google",
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "http://c1r3s1.42porto.com:3000/auth/google/callback",
		},
		(accessToken, refreshToken, profile, done) => {
			try {
				const email = profile.email;
				const nickname = profile.displayName || profile.given_name;

				let user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);

				if (!user) {
					// Create user if not exists
					const stmt = db.prepare(`
				INSERT INTO users (nickname, password, email) VALUES (?, ?, ?)
			`);
					const defaultPassword = "google_oauth"; // or random string
					const result = stmt.run(nickname, defaultPassword, email);
					user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(result.lastInsertRowid);
				}

				done(null, user);
			} catch (err) {
				console.error("Google login error:", err);
				done(err);
			}
		}
	)
);

fastifyPassport.registerUserDeserializer(async (user, req) => {
	return user;
});
fastifyPassport.registerUserSerializer(async (user, req) => {
	return user;
});

fastify.get(
	"/auth/google/callback",
	{
		preValidation: fastifyPassport.authenticate("google", { scope: ["profile", "email"] }),
	},
	async (req, res) => {
		console.log(req.hostname);
		res.redirect(`http://c1r3s1.42porto.com:5173/#profile`);
	}
);

fastify.get(
	"/logingoogle",
	fastifyPassport.authenticate("google", {
		scope: ["profile", "email"],
	})
);

fastify.decorate("authenticate", async function (request, reply) {
	try {
		const authHeader = request.headers.authorization;
		if (!authHeader) {
			return reply.code(401).send({ error: "Access denied" });
		}
		const token = authHeader.split(' ')[1]; // if using "Bearer <token>"

		const decoded = jwt.verify(token, 'your-secret-key'); //TODO: key in env
		request.userId = decoded.userId;
		const user = db.prepare('SELECT nickname FROM users WHERE id = ?').get(decoded.userId);
		request.userNickname = user.nickname;
	} catch (err) {
		reply.code(401).send({ error: "Invalid token" });
	}
});


fastify.get("/logout", async (req, res) => {
	req.logout();
	req.session.delete();
	res.clearCookie("session", { path: "/" });

	return res.send({ success: true });
});
fastify.get("/me", async (request, reply) => {
	const sessionUser = request.session.get('user');
	if (sessionUser) {
		return { user: sessionUser.nickname };
	} else {
		return reply.status(401).send({ error: "Not logged in" });
	}
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
				const allowedPattern = /^http:\/\/(10\.11\.\d+\.\d+|c\d+r\d+s\d+\.42porto\.com|localhost:5173|172\.30\.94\.112:5173)(:\d+)?$/;
				if (allowedPattern.test(origin)) cb(null, origin);
				else cb(null, false);
			},
			credentials: true,
			methods: ['GET', 'POST', 'PUT', 'PATCH', 'UPDATE', 'DELETE', 'OPTIONS'],
		});


		// Dynamically register all route files
		await registerRoutes();

		// Serve frontend static files
		fastify.register(fastifyStatic, {
			root: path.join(__dirname, "../../frontEnd"),
			prefix: "/",
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
