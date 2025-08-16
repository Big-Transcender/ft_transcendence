let presenceSocket: WebSocket | null = null;
const onlineUsers = new Set<string>();

// Start presence WebSocket
function startPresenceSocket() {
    const nickname = getNickOnLocalStorage();
    if (!nickname) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
	const wsHost = window.location.host;
	presenceSocket = new WebSocket(`${wsProtocol}://${wsHost}/presence`);

    presenceSocket.onopen = () => {
        console.log('✅ Connected to presence socket');
        presenceSocket?.send(JSON.stringify({
            type: 'register',
            nickname: nickname
        }));
    };
    
    presenceSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'user_online') {
            onlineUsers.add(data.nickname);
            updateFriends()
        } else if (data.type === 'user_offline') {
            onlineUsers.delete(data.nickname);
            updateFriends()
        }
    };
    
    presenceSocket.onclose = () => {
        console.log('❌ Presence socket disconnected');
        setTimeout(() => {
            if (checkIfLogged()) startPresenceSocket();
        }, 3000);
    };
}

function stopPresenceSocket() {
    if (presenceSocket) {
        console.log('🔌 Stopping presence socket...');
        presenceSocket.close();
        presenceSocket = null;
    }
    
    // Clear online users when disconnecting
    onlineUsers.clear();
    
    // Update friends display to show all as offline

}


// Add friend
async function addFriend(nickname: string) {
    try {
        const response = await fetch(`${backendUrl}/friends/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ friendNickname: nickname })
        });
        
        const data = await response.json();
        if (response.ok) {
            console.log(`✅ Added ${nickname} as friend`);

        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error adding friend:', error);
    }
}

// Remove friend
async function removeFriend(nickname: string) {
    try {
        const response = await fetch(`${backendUrl}/friends/remove`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ friendNickname: nickname })
        });
        
        if (response.ok) {
            console.log(`❌ Removed ${nickname} from friends`);

        }
    } catch (error) {
        console.error('Error removing friend:', error);
    }
}



// Setup add friend input
function setupAddFriend() {
    const input = document.getElementById('friendSearchInput') as HTMLInputElement;
    const button = document.getElementById('searchUsersBtn') as HTMLButtonElement;
    
    if (input && button) {
        button.onclick = () => {
            const nickname = input.value.trim();
            if (nickname) {
                addFriend(nickname);
                input.value = '';
            }
        };
        
        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                const nickname = input.value.trim();
                if (nickname) {
                    addFriend(nickname);
                    input.value = '';
                }
            }
        };
    }
}

// Initialize if logged in
if (checkIfLogged()) {
    startPresenceSocket();
    setupAddFriend();
}