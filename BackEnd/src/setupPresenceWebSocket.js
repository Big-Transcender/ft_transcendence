const WebSocket = require('ws');

const onlineUsers = new Set(); // Just store nicknames of online users

function setupPresenceWebSocket(server) {
    const presenceWss = new WebSocket.Server({ 
        server,
        path: '/presence'
    });

    presenceWss.on('connection', (ws) => {
        let userNickname = null;

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                
                if (data.type === 'register' && data.nickname) {
                    userNickname = data.nickname;
                    onlineUsers.add(userNickname);
                    
                    // Broadcast to all clients that this user is online
                    broadcastUserStatus(userNickname, true);
                    
                    console.log(`👤 ${userNickname} is now online (${onlineUsers.size} total)`);
                }
            } catch (error) {
                console.error('Error parsing presence message:', error);
            }
        });

        ws.on('close', () => {
            if (userNickname) {
                onlineUsers.delete(userNickname);
                broadcastUserStatus(userNickname, false);
                console.log(`👤 ${userNickname} is now offline (${onlineUsers.size} total)`);
            }
        });

        ws.on('error', (error) => {
            console.error('Presence WebSocket error:', error);
        });
    });

    function broadcastUserStatus(nickname, isOnline) {
        const message = JSON.stringify({
            type: isOnline ? 'user_online' : 'user_offline',
            nickname: nickname
        });

        presenceWss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    console.log('✅ Presence WebSocket server setup complete');
    return presenceWss;
}

function getOnlineUsers() {
    return Array.from(onlineUsers);
}

module.exports = {
    setupPresenceWebSocket,
    getOnlineUsers
};