let winsNumber = document.getElementById("boxWinsNumber");
let losesNumber = document.getElementById("boxLosesNumber");
let gamesNumber = document.getElementById("boxGamesNumber");
let positionNumber = document.getElementById("positionId");
let winRateText = document.getElementById("winRateTextId");
const backendUrl = `http://${window.location.hostname}:3000`;
const frontendUrl = `http://${window.location.hostname}:5173`;
const matchesProfile = document.querySelector(".matchesProfile");
const friendsProfile = document.querySelector(".friendsProfile");
let matchOpen = false;
let friendsOpen = false;
let isPlayingSoundMatch = false;
let isPlayingSoundFriends = false;
getUserStats(getNickOnLocalStorage());
async function flipboardNumberAnimation(target, targetBox) {
    targetBox.textContent = "";
    let flips = 50;
    let delay = 100;
    // Inicializa todos os dígitos como "0"
    const spans = [];
    for (let i = 0; i < target.length; i++) {
        const span = document.createElement("span");
        span.textContent = "0";
        targetBox.appendChild(span);
        spans.push(span);
    }
    // Array para controlar se o dígito já acertou
    const locked = new Array(target.length).fill(false);
    for (let f = 0; f < flips; f++) {
        let allLocked = true;
        for (let i = 0; i < target.length; i++) {
            if (!locked[i]) {
                const randomDigit = Math.floor(Math.random() * 10).toString();
                spans[i].textContent = randomDigit;
                if (randomDigit === target[i]) {
                    locked[i] = true;
                }
                else {
                    allLocked = false;
                }
            }
        }
        if (allLocked)
            break;
        await new Promise((res) => setTimeout(res, delay));
    }
    // Garante que todos os dígitos finais estão corretos
    for (let i = 0; i < target.length; i++) {
        spans[i].textContent = target[i];
    }
}
function getUserPosition() {
    const userNick = localStorage.getItem("nickname");
    fetch(`${backendUrl}/leaderboard/position/${userNick}`)
        .then((response) => {
        if (!response.ok) {
            return response.json().then((err) => {
                throw new Error(err.error || "Unknown error");
            });
        }
        return response.json();
    })
        .then((data) => {
        positionNumber.textContent = data.position + "º";
    })
        .catch((error) => {
        console.error("Failed to fetch leaderboard position:", error.message);
    });
}
async function getUserStats(nickname) {
    if (checkIfLogged()) {
        fetch(`${backendUrl}/player-stats/${nickname}`)
            .then((response) => {
            if (!response.ok) {
                return response.json().then((err) => {
                    throw new Error(err.error || "Unknown error");
                });
            }
            return response.json();
        })
            .then((stats) => {
            flipboardNumberAnimation(stats.wins.toString(), winsNumber);
            flipboardNumberAnimation(stats.defeats.toString(), losesNumber);
            flipboardNumberAnimation(stats.games_played.toString(), gamesNumber);
            winRateText.textContent = "Current Winrate: " + stats.win_percentage;
            getUserPosition();
        })
            .catch((error) => {
            console.error("Failed to fetch player stats:", error.message);
        });
    }
}
document.addEventListener("DOMContentLoaded", async () => {
    const switchNick = document.querySelector(".pupupSwitchButton");
    const matchesButton = document.getElementById("matchesButtonID");
    const friendsButton = document.getElementById("friendsButtonID");
    // SWITCH NICK FUNCTION
    switchNick.addEventListener("click", () => {
        const nickInput = document.getElementById("popupNewNick").value.trim();
        displayWarning(nickInput);
    });
    // OPEN MATCH HISTORY
    matchesButton.addEventListener("click", () => {
        matchesAnimationHandler();
    });
    // OPEN FRIEND LIST
    friendsButton.addEventListener("click", () => {
        updateFriends();
        friendsAnimationHandler();
    });
});
async function matchesAnimationHandler() {
    if (!matchOpen && !isPlayingSoundMatch) {
        updateLeaderboard();
        isPlayingSoundMatch = true;
        openSound.play();
        matchesProfile.classList.remove("closeMatchAnimation");
        matchesProfile.classList.add("openMatchAnimation");
        await betterWait(1500);
        matchesProfile.style.left = "-22%";
        matchesProfile.style.opacity = "1";
        matchesProfile.classList.remove("openMatchAnimation");
        await betterWait(100);
        matchOpen = true;
        isPlayingSoundMatch = false;
    }
    else if (matchOpen && !isPlayingSoundMatch) {
        closeSound.play();
        isPlayingSoundMatch = true;
        matchesProfile.classList.remove("openMatchAnimation");
        matchesProfile.classList.add("closeMatchAnimation");
        await betterWait(1000);
        matchesProfile.style.left = "30%";
        matchesProfile.style.opacity = "none";
        matchesProfile.classList.remove("closeMatchAnimation");
        await betterWait(100);
        matchOpen = false;
        isPlayingSoundMatch = false;
    }
}
async function friendsAnimationHandler() {
    if (!friendsOpen && !isPlayingSoundFriends) {
        isPlayingSoundFriends = true;
        openSound2.play();
        friendsProfile.classList.remove("closeFriendsAnimation");
        friendsProfile.classList.add("openFriendsAnimation");
        await betterWait(1000);
        friendsProfile.classList.remove("openFriendsAnimation");
        friendsProfile.style.left = "122%";
        friendsOpen = true;
        isPlayingSoundFriends = false;
    }
    else if (friendsOpen && !isPlayingSoundFriends) {
        isPlayingSoundFriends = true;
        closeSound2.play();
        friendsProfile.classList.add("closeFriendsAnimation");
        friendsProfile.classList.remove("openFriendsAnimation");
        friendsOpen = false;
        await betterWait(1000);
        friendsProfile.classList.remove("closeFriendsAnimation");
        friendsProfile.style.left = "70%";
        isPlayingSoundFriends = false;
    }
}
async function updateFriends() {
    try {
        const response = await fetch(`${backendUrl}/friends`, {
            credentials: 'include' // Important for session authentication
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Friends data:", data);
        // Get the friends table (not the leaderboard table)
        const table = document.getElementById("friendListId");
        if (!table) {
            console.error("Friends table not found!");
            return;
        }
        // Clear existing rows (except header)
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        // Check if we have friends data
        if (data.friends && data.friends.length > 0) {
            // Insert new rows for each friend
            data.friends.forEach((friend) => {
                const row = table.insertRow();
                // Friend name
                const nameCell = row.insertCell();
                nameCell.textContent = friend.nickname;
                // Online status
                const statusCell = row.insertCell();
                if (friend.isOnline) {
                    statusCell.innerHTML = '<span style="color: #4CAF50;">🟢 Online</span>';
                    statusCell.className = 'online-status';
                }
                else {
                    statusCell.innerHTML = '<span style="color: #757575;">🔴 Offline</span>';
                    statusCell.className = 'offline-status';
                }
            });
        }
        else {
            // Show "no friends" message
            const row = table.insertRow();
            const cell1 = row.insertCell();
            const cell2 = row.insertCell();
            cell1.textContent = "No friends yet";
            cell2.textContent = " yet";
            cell1.style.fontStyle = "italic";
            cell1.style.color = "#666";
        }
        // Fill remaining rows with placeholders (if you want exactly 5 rows)
        const currentRows = table.rows.length - 1; // Subtract header row
        const maxRows = 5;
        for (let i = currentRows; i < maxRows; i++) {
            const row = table.insertRow();
            row.insertCell().textContent = "-----";
            row.insertCell().textContent = "-----";
        }
    }
    catch (error) {
        console.error("Failed to load friends:", error);
        // Show error in table
        const table = document.getElementById("friendListId");
        if (table) {
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            const row = table.insertRow();
            const cell1 = row.insertCell();
            const cell2 = row.insertCell();
            cell1.textContent = "Error loading friends";
            cell2.textContent = "-----";
            cell1.style.color = "#ff0000";
        }
    }
}
