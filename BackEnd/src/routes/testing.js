const db = require('../database');
const bcrypt = require('bcryptjs');
const {getTournamentByCode} = require("../dataQuerys");

module.exports = async function (fastify) {
    fastify.get('/test/users', async (request, reply) => {
        const users = db.prepare('SELECT * FROM users').all();
        reply.send(users);
    });

    fastify.get('/test/tournaments', async (request, reply) => {
        const tournaments = db.prepare('SELECT * FROM tournaments').all();
        reply.send(tournaments);
    });

    fastify.get('/test/matches', async (request, reply) =>{
        const matches = db.prepare('SELECT * FROM matches').all();
        reply.send(matches);
    });

    fastify.get('/test/tournament_players', async (request, reply) =>{
        const tournament_players = db.prepare('SELECT * FROM tournament_players').all();
        reply.send(tournament_players);
    });

    fastify.post('/test/reset-database', async (request, reply) => {
        db.prepare('DROP TABLE IF EXISTS tournament_players').run();
        db.prepare('DROP TABLE IF EXISTS matches').run();
        db.prepare('DROP TABLE IF EXISTS tournaments').run();
        db.prepare('DROP TABLE IF EXISTS users').run();

        db.prepare(`
            CREATE TABLE IF NOT EXISTS users (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 nickname TEXT NOT NULL UNIQUE,
                                                 password TEXT NOT NULL,
                                                 email TEXT NOT NULL UNIQUE
            )
        `).run();

        db.prepare(`
            CREATE TABLE IF NOT EXISTS tournaments (
                                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                       name TEXT NOT NULL,
                                                       code INTEGER NOT NULL UNIQUE,
                                                       created_by INTEGER NOT NULL,
                                                       started BOOL DEFAULT 0,
                                                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        db.prepare(`
            CREATE TABLE IF NOT EXISTS matches (
                                                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                   tournament_id INTEGER, -- nullable
                                                   player1_id INTEGER NOT NULL,
                                                   player2_id INTEGER NOT NULL,
                                                   winner_id INTEGER NOT NULL,
                                                   score_p1 INTEGER NOT NULL,
                                                   score_p2 INTEGER NOT NULL,
                                                   FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
                                                   FOREIGN KEY (player1_id) REFERENCES users(id),
                                                   FOREIGN KEY (player2_id) REFERENCES users(id),
                                                   FOREIGN KEY (winner_id) REFERENCES users(id)
            )
        `).run();

        db.prepare(`
            CREATE TABLE IF NOT EXISTS tournament_players (
                                                              tournament_id INTEGER,
                                                              user_id INTEGER,
                                                              joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                              PRIMARY KEY (tournament_id, user_id),
                                                              FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
                                                              FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `).run();

        // Insert 7 users
        const users = [
            'bousa',
            'bde',
            'diogosan',
            'diodos-s',
            'cacarval',
            'rumachad',
            'jmarinho'
        ];
        const insertUser = db.prepare('INSERT INTO users (nickname, email, password) VALUES (?, ?, ?)');
        const hashedPassword = bcrypt.hashSync('Password1!', 10);
        for (const nick of users) {
            insertUser.run(nick, `${nick}@mail.com`, hashedPassword);
        }

        const insertTournament = db.prepare('' +
            'INSERT INTO tournaments (name, code, created_by, started, created_at)' +
            'VALUES (?, ?, ?, ?, ?)');
        insertTournament.run('42 Tournament', "1111", '1', '0', new Date().toISOString());
        insertTournament.run('42 Tournament', "2222", '1', '0', new Date().toISOString());
        insertTournament.run('42 Tournament', "3333", '1', '0', new Date().toISOString());
        insertTournament.run('42 Tournament', "4444 ", '1', '0', new Date().toISOString());

        const insertMatch = db.prepare('INSERT INTO matches (tournament_id, player1_id, player2_id, winner_id, score_p1, score_p2) VALUES (?, ?, ?, ?, ?, ?)');
        insertMatch.run(1, 1,2,1, 10, 8);
        insertMatch.run(2, 1,2,1, 10, 8);
        reply.send({ message: 'Database reset' });
    });
};
