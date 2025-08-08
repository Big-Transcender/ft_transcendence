let presenceSocket: WebSocket | null = null;
const onlineUsers = new Set<string>();

// Start presence WebSocket
function startPresenceSocket() {
    const nickname = getNickOnLocalStorage();
    if (!nickname) return;

    presenceSocket = new WebSocket(`ws://${window.location.hostname}:3000/presence`);
    
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
            updateFriendsDisplay();
        } else if (data.type === 'user_offline') {
            onlineUsers.delete(data.nickname);
            updateFriendsDisplay();
        }
    };
    
    presenceSocket.onclose = () => {
        console.log('❌ Presence socket disconnected');
        setTimeout(() => {
            if (checkIfLogged()) startPresenceSocket();
        }, 3000);
    };
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
            updateFriendsDisplay();
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
            updateFriendsDisplay();
        }
    } catch (error) {
        console.error('Error removing friend:', error);
    }
}

// Update friends display
async function updateFriendsDisplay() {
    try {
        const response = await fetch(`${backendUrl}/friends`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        const friendsContainer = document.getElementById('friendsListContainer');
        
        if (!friendsContainer) return;
        
        friendsContainer.innerHTML = '';
        
        data.friends.forEach(friend => {
            const div = document.createElement('div');
            div.className = `friend-item ${friend.isOnline ? 'online' : 'offline'}`;
            div.innerHTML = `
                <span>${friend.nickname}</span>
                <span class="${friend.isOnline ? 'online' : 'offline'}">
                    ${friend.isOnline ? '🟢' : '🔴'}
                </span>
                <button onclick="removeFriend('${friend.nickname}')">Remove</button>
            `;
            friendsContainer.appendChild(div);
        });
    } catch (error) {
        console.error('Error updating friends:', error);
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
    updateFriendsDisplay();
    setupAddFriend();
}