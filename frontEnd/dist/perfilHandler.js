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
preVisualizePhoto();
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
async function getUserPosition() {
    const userNick = localStorage.getItem("nickname");
    try {
        // const response = await fetch(`${backendUrl}/leaderboard/position/${userNick}`);
        // const response = await fetch(`${backendUrl}/leaderboard/position/`);
        const token = localStorage.getItem("token");
        const response = await fetch(`${backendUrl}/leaderboard/position/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            credentials: "include",
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Unknown error");
        }
        const data = await response.json();
        return data.position.toString();
    }
    catch (error) {
        console.error("Failed to fetch leaderboard position:", error.message);
        return "";
    }
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
            .then(async (stats) => {
            const positionStr = await getUserPosition();
            flipboardNumberAnimation(stats.wins.toString(), winsNumber);
            flipboardNumberAnimation(stats.defeats.toString(), losesNumber);
            flipboardNumberAnimation(stats.games_played.toString(), gamesNumber);
            flipboardNumberAnimation(positionStr, positionNumber);
            await setProfileAvatar();
            winRateText.textContent = "Current Winrate: " + stats.win_percentage;
        })
            .catch((error) => {
            console.error("Failed to fetch player stats:", error.message);
        });
    }
}
document.addEventListener("DOMContentLoaded", async () => {
    const profileOptions = document.getElementById("profileOptionsButtonID");
    const matchesButton = document.getElementById("matchesButtonID");
    const friendsButton = document.getElementById("friendsButtonID");
    const addFriendsButton = document.getElementById("addFriendId");
    const refreshMatchesButton = document.getElementById("refreshMatchId");
    const photoPopupButtom = document.getElementById("popupPhotoButtonID");
    const popupNickButton = document.getElementById("popupNickButtonID");
    const popupEmailButton = document.getElementById("popupEmailButtonID");
    const popupPasswordButton = document.getElementById("popupPasswordButtonID");
    const frontpagePopup = document.querySelector(".frontpagePopup");
    const nickpagePopup = document.querySelector(".nickpagePopup");
    const emailpagePopup = document.querySelector(".emailpagePopup");
    const passwordpagePopup = document.querySelector(".passwordpagePopup");
    const photopagePopup = document.querySelector(".photopagePopup");
    // PROFILE OPTIONS
    profileOptions.addEventListener("click", () => {
        openPopup();
        // const nickInput = (document.getElementById("popupNewNick") as HTMLInputElement).value.trim();
        // displayWarning(nickInput);
    });
    // OPEN MATCH HISTORY
    matchesButton.addEventListener("click", () => {
        updateMatchHistory();
        matchesAnimationHandler();
    });
    // OPEN FRIEND LIST
    friendsButton.addEventListener("click", async () => {
        await updateFriends();
        friendsAnimationHandler();
    });
    //ADD FRIEND BUTTOM
    addFriendsButton.addEventListener("click", async () => {
        const addFriendInput = document.getElementById("inputFriend").value.trim();
        if (!addFriendInput) {
            displayWarning("No nick!");
            return;
        }
        addfriendHandler(addFriendInput);
    });
    // REFRESH MATCHES LIST BUTTOM
    refreshMatchesButton.addEventListener("click", async () => {
        displayWarning("THIS REFRESH THE LIST");
    });
    // POPUP PHOTO BUTTOM
    photoPopupButtom.addEventListener("click", async () => {
        await betterWait(150);
        changePopupTo(frontpagePopup, photopagePopup);
        const fileInput = document.getElementById("fileInput");
        fileInput.value = "";
        //#TODO Need a function to take the current photo of user, so it clear the last upload
    });
    // POPUP NICK BUTTOM
    popupNickButton.addEventListener("click", async () => {
        await betterWait(150);
        changePopupTo(frontpagePopup, nickpagePopup);
    });
    // POPUP EMAIL BUTTOM
    popupEmailButton.addEventListener("click", async () => {
        await betterWait(150);
        changePopupTo(frontpagePopup, emailpagePopup);
    });
    // POPUP PASSWORK BUTTOM
    popupPasswordButton.addEventListener("click", async () => {
        await betterWait(150);
        changePopupTo(frontpagePopup, passwordpagePopup);
    });
});
function changePopupTo(remove, activate) {
    remove.classList.remove("displayPagePopup");
    activate.classList.add("displayPagePopup");
}
function addfriendHandler(friendNick) {
    //#TODO Make the logic of addfriend here!
}
function openPopup() {
    document.getElementById("popupContainer").style.display = "flex";
    document.querySelectorAll(".popupPage").forEach((el) => {
        el.classList.remove("displayPagePopup");
    });
    document.querySelector(".frontpagePopup").classList.add("displayPagePopup");
}
function closePopup() {
    document.getElementById("popupContainer").style.display = "none";
}
async function changeNickPopup() {
    const newNick = document.getElementById("popupNewNick").value.trim();
    if (!newNick)
        displayWarning("No nick has been given!");
    else {
        //#TODO here where you change the nick
        await changeNickAPI(newNick);
        // displayWarning(newNick);
    }
}
function changeEmailPopup() {
    const newEmail = document.getElementById("popupNewEmail").value.trim();
    if (!newEmail)
        displayWarning("No email has been given!");
    else {
        changeEmailAPI(newEmail);
    }
}
function changePasswordPopup() {
    const oldPassword = document.getElementById("popupOldPassword").value.trim();
    const newPassword = document.getElementById("popupNewPassword").value.trim();
    if (!newPassword || !oldPassword)
        displayWarning("No password has been given!");
    else {
        //#TODO here where you change the password
        changePasswordAPI(newPassword, oldPassword);
        // displayWarning(newPassword);
    }
}
function changePhotoPopup() {
    const newPhoto = document.getElementById("fileInput");
    if (!newPhoto || !newPhoto.files || newPhoto.files.length === 0) {
        displayWarning("No photo has been given!");
        return;
    }
    const file = newPhoto.files[0];
    const formData = new FormData();
    formData.append('file', file);
    fetch(`${backendUrl}/avatar`, {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
        .then(response => response.json())
        .then(data => {
        if (data.success && data.url) {
            // Update only profile photo location elements
            const photoElements = document.querySelectorAll('.profilePhotoLocation');
            photoElements.forEach((el) => {
                if (el instanceof HTMLImageElement) {
                    el.src = backendUrl + data.url + '?t=' + Date.now(); // cache busting
                }
                else {
                    el.style.backgroundImage = `url('${backendUrl + data.url}?t=${Date.now()}')`;
                }
            });
            setProfileAvatar(); // Ensure avatar is refreshed everywhere after upload
            displayWarning("Photo updated successfully!");
        }
        else {
            displayWarning("Failed to update photo.");
        }
    })
        .catch(() => {
        displayWarning("Error uploading photo.");
    });
}
function preVisualizePhoto() {
    document.addEventListener("DOMContentLoaded", () => {
        const fileInput = document.getElementById("fileInput");
        const photoLocation = document.querySelector(".profilePhotoLocation");
        if (fileInput && photoLocation) {
            fileInput.addEventListener("change", (event) => {
                const target = event.target;
                if (target.files && target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        var _a;
                        photoLocation.style.backgroundImage = `url('${(_a = e.target) === null || _a === void 0 ? void 0 : _a.result}')`;
                    };
                    reader.readAsDataURL(target.files[0]);
                }
            });
        }
    });
}
async function matchesAnimationHandler() {
    if (!matchOpen && !isPlayingSoundMatch) {
        // updateLeaderboard();
        isPlayingSoundMatch = true;
        openSound.play();
        matchesProfile.classList.remove("closeMatchAnimation");
        matchesProfile.classList.add("openMatchAnimation");
        await betterWait(1500);
        matchesProfile.style.left = "-25%";
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
        friendsProfile.style.left = "125%";
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
        const token = localStorage.getItem("token");
        const response = await fetch(`${backendUrl}/friends`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
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
        // Insert new rows for each friend
        data.friends.forEach((friend) => {
            const row = table.insertRow();
            const nameCell = row.insertCell();
            nameCell.textContent = friend.nickname;
            const statusCell = row.insertCell();
            if (friend.isOnline) {
                statusCell.innerHTML = '<span style="color: #063508ff;">🟢 Online</span>';
                statusCell.className = "online-status";
            }
            else {
                statusCell.innerHTML = '<span style="color: #757575;">🔴 Offline</span>';
                statusCell.className = "offline-status";
            }
        });
        // Fill remaining rows with placeholders
        const currentRows = table.rows.length - 1;
        const maxRows = 5;
        for (let i = currentRows; i < maxRows; i++) {
            const row = table.insertRow();
            row.insertCell().textContent = "-----";
            row.insertCell().textContent = "-----";
        }
    }
    catch (error) {
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
            cell2.textContent = `${error}`;
            cell1.style.color = "#ff0000";
        }
    }
}
async function updateMatchHistory() {
    const nickname = getNickOnLocalStorage();
    if (!nickname)
        return;
    try {
        const token = localStorage.getItem("token");
        // const response = await fetch(`${backendUrl}/player-matches/${nickname}`, {
        const response = await fetch(`${backendUrl}/player-matches/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            credentials: "include",
        });
        console.log("hahahaha");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Get the match history table
        const table = document.getElementById("matchListId");
        if (!table) {
            console.error("Match history table not found!");
            return;
        }
        // Clear existing rows (except header)
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        // Insert new rows for each match
        data.forEach((match) => {
            const row = table.insertRow();
            // ✅ Column 1: Result (WIN/LOSS)
            const resultCell = row.insertCell();
            resultCell.textContent = match.result;
            resultCell.style.color = match.result === "WIN" ? "#4CAF50" : "#f44336";
            resultCell.style.fontWeight = "bold";
            // ✅ Column 2: Score
            const scoreCell = row.insertCell();
            scoreCell.textContent = match.score;
            // ✅ Column 3: Opponent
            const opponentCell = row.insertCell();
            opponentCell.textContent = match.opponent;
        });
        // Fill remaining rows with placeholders (if you want exactly 5 rows)
        const currentRows = table.rows.length - 1; // Subtract header row
        const maxRows = 5;
        for (let i = currentRows; i < maxRows; i++) {
            const row = table.insertRow();
            row.insertCell().textContent = "-----";
            row.insertCell().textContent = "-----";
            row.insertCell().textContent = "-----";
        }
    }
    catch (error) {
        console.error("Failed to load match history:", error);
        // Show error in table
        const table = document.getElementById("matchListId");
        if (table) {
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            const row = table.insertRow();
            const cell1 = row.insertCell();
            const cell2 = row.insertCell();
            const cell3 = row.insertCell();
            cell1.textContent = "Error loading matches";
            cell2.textContent = "-----";
            cell3.textContent = "-----";
            cell1.style.color = "#ff0000";
        }
    }
}
async function changeNickAPI(newNick) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${backendUrl}/switch-nickname`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ nickname: newNick }),
        });
        const data = await response.json();
        if (!response.ok) {
            displayWarning(data.error || "Failed to switch nickname");
            return;
        }
        else {
            displayWarning("Nickname changed successfully!");
            // Update localStorage and refresh profile data
            //TODO need to put the correct function to change nickname
            localStorage.setItem("nickname", newNick);
            putNickOnProfileHeader(newNick);
            await getUserStats(newNick);
        }
    }
    catch (error) {
        displayWarning(error.message || "Error changing nickname");
    }
}
async function changePasswordAPI(newPassword, oldPassword) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${backendUrl}/switch-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ oldPassword, newPassword }),
        });
        console.log(oldPassword);
        console.log(newPassword);
        const data = await response.json();
        if (!response.ok) {
            displayWarning(data.error || "Failed to change password");
            return;
        }
        else {
            displayWarning("Password changed successfully!");
        }
    }
    catch (error) {
        displayWarning(error.message || "Error changing password");
    }
}
async function changeEmailAPI(newEmail) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${backendUrl}/switch-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: newEmail }),
        });
        const data = await response.json();
        if (!response.ok) {
            displayWarning(data.error || "Failed to switch email");
        }
        displayWarning("Email changed successfully!");
    }
    catch (error) {
        const errorMessage = error.message || "Error changing email";
        displayWarning(errorMessage);
    }
}
// Fetch and set the user's avatar on the profile page
async function setProfileAvatar() {
    const token = localStorage.getItem("token");
    if (!token)
        return;
    try {
        const response = await fetch(`${backendUrl}/me/avatar`, {
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include',
        });
        const data = await response.json();
        const avatarUrl = data.avatar.startsWith('/') ? backendUrl + data.avatar : data.avatar;
        const photoElements = document.querySelectorAll('.profilePhotoLocation');
        photoElements.forEach((el) => {
            if (el instanceof HTMLImageElement) {
                el.src = avatarUrl + '?t=' + Date.now(); // cache busting
            }
            else {
                el.style.backgroundImage = `url('${avatarUrl}?t=${Date.now()}')`;
            }
        });
    }
    catch (e) {
        // Optionally handle error
    }
}
// SPA: Always refresh avatar on profile page navigation
function handleProfilePageNavigation() {
    if (window.location.pathname.includes('perfil') || window.location.pathname.includes('profile')) {
        setProfileAvatar();
    }
}
// Listen for SPA navigation events
window.addEventListener('popstate', handleProfilePageNavigation);
window.addEventListener('pushstate', handleProfilePageNavigation);
window.addEventListener('replacestate', handleProfilePageNavigation);
// Also run on initial load
handleProfilePageNavigation();
