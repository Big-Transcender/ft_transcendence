const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const path = require('path');
const fs = require('fs');
const fastifyPassport = require('@fastify/passport');
const fastifySecureSesion = require("@fastify/secure-session");
const fastifyStatic = require('@fastify/static');
const setupWebSocket = require('./socketConnection');
const GoogleStrategy = require('passport-google-oauth2').Strategy
const dotenv = require('dotenv');

const db = require('./database');

dotenv.config()

fastify.register(fastifySecureSesion, {
	key: fs.readFileSync(path.join(__dirname, 'not-so-secret-key')),
	cookie: {
		path: '/'
	}
})

fastify.register(fastifyPassport.initialize())
fastify.register(fastifyPassport.secureSession())

fastifyPassport.use('google', new GoogleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: "http://localhost:3000/auth/google/callback"
}, async function (accessToken, refreshToken, profile, done) {
	try {
		const email = profile.email;

		// Look for existing user in your DB
		const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

		console.log("📧 Google profile email:", profile.email);
		if (user) {
			// ✅ User exists — continue
			done(null, user);
		} else {
			// ❌ User not found — reject login
			done(null, false, { message: "User not found in database" });
		}
	} catch (err) {
		done(err);
	}
}));


fastifyPassport.registerUserDeserializer(async (user, req) => {
	return user
})
fastifyPassport.registerUserSerializer(async (user, req) =>
{
	return user
})

fastify.get('/auth/google/callback',
	{
		preValidation: fastifyPassport.authenticate('google', {scope:['profile', 'email']})},
	async (req, res) => {
	res.redirect('/')
	})
fastify.get('/logingoogle', fastifyPassport.authenticate('google', {scope: ['profile', 'email']}))

fastify.get('/logout',
	async (req,res) =>
	{
		req.logout()
		return {success:true}
	})

fastify.get('/me', async (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return { user: req.user };
    } else {
        res.code(401);
        return { error: 'Not authenticated' };
    }
});

async function registerRoutes() {
	const routesDir = path.join(__dirname, 'routes');
	const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

	for (const file of files) {
		const route = require(path.join(routesDir, file));
		await route(fastify);  // each route file is a function that registers routes on fastify
	}
}

async function start() {
	try {
		await fastify.register(cors, { origin: '*' });

		// Setup WebSocket connection
		setupWebSocket(fastify.server);

		// Dynamically register all route files
		await registerRoutes();

		// Serve frontend static files
		fastify.register(fastifyStatic, {
			root: path.join(__dirname, '../../frontEnd'),
			prefix: '/',
		});

		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log('✅ Server started at http://localhost:3000');
	} catch (error) {
		console.error('❌ Failed to start:', error);
		process.exit(1);
	}
}

start();
