const fs = require('fs');
const path = require('path');

const FRIENDS_FILE = path.join(__dirname, 'friends.json');

function loadFriends() {
    try {
        if (fs.existsSync(FRIENDS_FILE)) {
            const data = fs.readFileSync(FRIENDS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading friends:', error);
    }
    return {};
}

function saveFriends(friendsData) {
    try {
        fs.writeFileSync(FRIENDS_FILE, JSON.stringify(friendsData, null, 2));
    } catch (error) {
        console.error('Error saving friends:', error);
    }
}

let friendsData = loadFriends();

function getFriends(nickname) {
    return friendsData[nickname] || [];
}

function addFriend(nickname, friendNickname) {
    if (!friendsData[nickname]) {
        friendsData[nickname] = [];
    }
    
    if (!friendsData[nickname].includes(friendNickname)) {
        friendsData[nickname].push(friendNickname);
        saveFriends(friendsData);
        return true;
    }
    return false;
}

function removeFriend(nickname, friendNickname) {
    if (friendsData[nickname]) {
        const index = friendsData[nickname].indexOf(friendNickname);
        if (index !== -1) {
            friendsData[nickname].splice(index, 1);
            saveFriends(friendsData);
            return true;
        }
    }
    return false;
}

module.exports = {
    getFriends,
    addFriend,
    removeFriend
};