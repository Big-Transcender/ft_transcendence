// deleteAllUsers.js
const Database = require('better-sqlite3');
const db = new Database('./../db/mydatabase.db');
db.prepare('DELETE FROM users').run();
console.log('All users deleted.');