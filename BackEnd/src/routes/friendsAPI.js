const { getFriends, addFriend, removeFriend } = require('../friendsStorage');
const { getOnlineUsers } = require('../wsManager');

module.exports = async function (fastify) {
    
    // Add friend
    fastify.post('/friends/add', async (request, reply) => {
        const { friendNickname } = request.body;
        const sessionUser = request.session.get('user');
        
        if (!sessionUser) return reply.code(401).send({ error: "Not logged in" });
        if (!friendNickname) return reply.code(400).send({ error: "Friend nickname required" });
        
        const success = addFriend(sessionUser.nickname, friendNickname);
        
        if (success) {
            return reply.send({ message: "Friend added" });
        } else {
            return reply.code(400).send({ error: "Already friends" });
        }
    });
    
    // Get friends with online status
    fastify.get('/friends', async (request, reply) => {
        const sessionUser = request.session.get('user');
        
        if (!sessionUser) return reply.code(401).send({ error: "Not logged in" });
        
        const friends = getFriends(sessionUser.nickname);
        const onlineUsers = getOnlineUsers();
        
        const friendsWithStatus = friends.map(friendNickname => ({
            nickname: friendNickname,
            isOnline: onlineUsers.includes(friendNickname)
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