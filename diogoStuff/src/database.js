const SQLite = require('fastify-sqlite')

async function setupDatabase(fastify)
{
	fastify.register(SQLite, {url: 'sqlite:./db.sqlite'});

	await fastify.after();
	

	await fastify.sqlite.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL
		)
	`);

	console.log("database created");
}

module.exports = setupDatabase;
