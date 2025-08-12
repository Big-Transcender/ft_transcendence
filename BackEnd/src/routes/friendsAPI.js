const { removeFriend } = require('../friendsStorage');
const { getOnlineUsers } = require('../wsManager');
const db = require('../database');
module.exports = async function (fastify) {

    fastify.post('/friends/add', {preHandler: fastify.authenticate } , async (request, reply) =>
    {
        const { friendNickname } = request.body;
        if (!friendNickname)
            return reply.code(400).send({ error: "Friend nickname required" });

        if (friendNickname === request.userNickname)
            return reply.code(400).send({ error: "Cannot add yourself as friend" });

        const friendRow = db.prepare('SELECT id FROM users WHERE nickname = ?').get(friendNickname);

        if (!friendRow)
            return reply.code(404).send({ error: "No Player found with that nickname" });

        const userId = request.userId;
        const friendId = friendRow.id;

        const [id1, id2] = userId < friendId ? [userId, friendId] : [friendId, userId];

        const exists = db.prepare('SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?').get(id1, id2);
        if (exists)
            return reply.code(400).send({ error: "Already friends" });

        db.prepare('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)').run(id1, id2);

        return reply.send({ success: true });
    });

    fastify.get('/friends', { preHandler: fastify.authenticate }, async (request, reply) => {
        const userId = request.userId;
        const onlineUsers = getOnlineUsers();

        const rows = db.prepare(`
        SELECT u.nickname
        FROM friends f
        JOIN users u ON (u.id = CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END)
        WHERE f.user_id = ? OR f.friend_id = ?
    `).all(userId, userId, userId);

        const friendsWithStatus = rows.map(row => ({
            nickname: row.nickname,
            isOnline: onlineUsers.includes(row.nickname)
        }));

        return reply.send({ friends: friendsWithStatus });
    });
    
    // Remove friend
    fastify.delete('/friends/remove', async (request, reply) => {
        const { friendNickname } = request.body;
        const sessionUser = request.session.get('user');
        
        if (!sessionUser) return reply.code(401).send({ error: "Not logged in" });
        
        const success = removeFriend(sessionUser.nickname, friendNickname);
        
        if (success) {
            return reply.send({ message: "Friend removed" });
        } else {
            return reply.code(404).send({ error: "Friend not found" });
        }
    });

    fastify.post('/test/setup-friends', async (request, reply) => {
        const { addFriend } = require('../friendsStorage');
        
        // Add 4 friends for diogosan
        const testFriends = ['bousa', 'bde', 'cacarval', 'rumachad'];
        
        testFriends.forEach(friendNick => {
            addFriend('diogosan', friendNick);
            addFriend(friendNick, 'diogosan'); // Make it bidirectional
        });
        
        return reply.send({ 
            message: `Added ${testFriends.length} friends for diogosan`,
            friends: testFriends 
        });
    });
};