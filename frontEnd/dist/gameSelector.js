// const pongButton = document.getElementById("pongButton");
const backGamePongButton = document.getElementById("backGamePongId");
const buttonSinglePong = document.getElementById("buttonSinglePong");
const buttonMultiplayerPong = document.getElementById("buttonMultiplayerPong");
const buttonVersusMP = document.getElementById("buttonVersusMPId");
const buttonLocalMP = document.getElementById("buttonLocalMP");
const closePopupPongButtom = document.querySelector(".pongPopupBackButton");
const joinPopupButton = document.querySelector(".joinPopupButton");
const createPopupButton = document.querySelector(".createPopupButton");
const create2V2PopupButton = document.querySelector(".createV2PopupButton");
const backButtonMP = document.getElementById("backButtonMPId");
const pongGamePage = document.getElementById("pongGameId");
const gameSelectorPongPage = document.getElementById("gameSelectorPongId");
const gameSelectorPongMultiplayerPage = document.getElementById("gameSelectorPongMultiplayerId");
const startGameTimer = document.getElementById("timerId");
const startGameTimerBox = document.getElementById("timerBoxId");
function setRandomBackground() {
    const bgNumber = Math.floor(Math.random() * 3) + 1;
    const board = document.querySelector(".board");
    switch (bgNumber) {
        case 1:
            board.style.backgroundImage = "url('/images/pongGame/pongGameBG1.png')";
            break;
        case 2:
            board.style.backgroundImage = "url('/images/pongGame/pongGameBG2.png')";
            break;
        case 3:
            board.style.backgroundImage = "url('/images/pongGame/pongGameBG3.png')";
            break;
    }
}
async function animateTimer() {
    const timer = document.querySelector(".timer");
    if (!timer)
        return;
    timer.style.opacity = "1";
    timer.style.animation = "timerAnimation 3s";
    // Remove a animação após terminar para poder reutilizar depois
    setTimeout(() => {
        timer.style.animation = "";
        timer.style.opacity = "0";
    }, 3000);
}
function updatePageHash(hash) {
    history.replaceState(undefined, "", hash);
}
document.addEventListener("DOMContentLoaded", () => {
    //BackButton in Pong
    backGamePongButton.addEventListener("click", () => {
        changePageTo(pongGamePage, gameSelectorPongPage);
        updatePageHash("#game1");
        backGamePongButton.classList.remove("active");
    });
    //Singleplayer Pong
    buttonSinglePong.addEventListener("click", () => {
        if (checkIfLogged()) {
            changePageTo(gameSelectorPongPage, pongGamePage);
            const matchId = generateMatchId();
            updatePageHash(`#pong/${matchId}`);
            startPongWebSocket(matchId, true, true);
            animateTimer();
            setRandomBackground();
            resetEmotions();
            setGameScore(getNickOnLocalStorage());
            backGamePongButton.classList.add("active");
            showMatchId("NONE");
        }
        else {
            displayWarning("You need to log in.");
        }
    });
    //Change to Multiplayer type selector
    buttonMultiplayerPong.addEventListener("click", () => {
        changePageTo(gameSelectorPongPage, gameSelectorPongMultiplayerPage);
        updatePageHash(`#pong/multiplayerMenu`);
    });
    //Change to Multiplayer Versus
    buttonVersusMP.addEventListener("click", async () => {
        openPopupPong();
    });
    //Change to Multiplayer Local
    buttonLocalMP.addEventListener("click", () => {
        if (checkIfLogged() || !checkIfLogged()) {
            changePageTo(gameSelectorPongMultiplayerPage, pongGamePage);
            const matchId = generateMatchId();
            updatePageHash(`#pong/${matchId}`);
            startPongWebSocket(matchId, true, false, false, [getNickOnLocalStorage() || "gigachad", "minichad"]); // true = local mode
            resetEmotions();
            animateTimer();
            setGameScore(getNickOnLocalStorage() || "gigachad", "minichad");
            backGamePongButton.classList.add("active");
            showMatchId(matchId);
        }
        else {
            displayWarning("You need to log in.");
        }
    });
    //Back button of Multiplayer type Selector
    backButtonMP.addEventListener("click", () => {
        changePageTo(gameSelectorPongMultiplayerPage, gameSelectorPongPage);
        updatePageHash(`#pong`);
    });
    // CLOSE POPUP BUTTOM
    closePopupPongButtom.addEventListener("click", () => {
        closePopupPong();
    });
});
async function checkMatchExists(matchId) {
    const response = await fetch(`${backendUrl}/pongGame/${matchId}/exists`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}
function joinExistingMatch(matchId) {
    history.replaceState(undefined, "", `#pong/${matchId}`);
    startPongWebSocket(matchId);
    changePageTo(gameSelectorPongMultiplayerPage, pongGamePage);
    backGamePongButton.classList.add("active");
    //animateTimer();
    resetEmotions();
    //setGameScore("Player 1", getNickOnLocalStorage());
}
function createNewMatch(isLocal = false, aiGame = false, teamGame = false) {
    const matchId = generateMatchId();
    history.replaceState(undefined, "", `#pong/${matchId}`);
    startPongWebSocket(matchId, isLocal, aiGame, teamGame); // Start as host
    changePageTo(gameSelectorPongMultiplayerPage, pongGamePage);
    backGamePongButton.classList.add("active");
    //animateTimer();
    resetEmotions();
    showMatchId(matchId);
    //setGameScore(getNickOnLocalStorage(), "Player 1");
}
function showErrorAndReturn(message) {
    alert(message);
    changePageTo(gameSelectorPongMultiplayerPage, gameSelectorPongPage);
}
function showMatchId(matchIdText) {
    document.querySelector(".gameIdBoxTextID").textContent = matchIdText;
    document.querySelector(".gameIdBox").style.opacity = "1";
}
function openPopupPong() {
    document.getElementById("popupContainerPong").style.display = "flex";
    // CREATE A MP MATCH
    createPopupButton.addEventListener("click", async () => {
        createNewMatch();
        closePopupPong();
    });
    // CREATE 2v2 MATCH
    create2V2PopupButton.addEventListener("click", async () => {
        closePopupPong();
        openPopup2v2();
    });
    // JOIN A MP MATCH
    joinPopupButton.addEventListener("click", async () => {
        const matchId = document.getElementById("popupMatchID").value.trim();
        if (!matchId) {
            displayWarning("Empty Match Id");
            return;
        }
        try {
            const matchData = await checkMatchExists(matchId);
            if (matchData.exists) {
                joinExistingMatch(matchId);
                showMatchId(matchId);
                closePopupPong();
            }
            else {
                //console.log("Match not found or is full.");
                displayWarning("Match not found or is full.");
                //showErrorAndReturn("Match not found or is full.");
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            displayWarning(`Error checking match: ${errorMessage}`);
        }
    });
}
function closePopupPong() {
    document.getElementById("popupContainerPong").style.display = "none";
}
function openPopup2v2() {
    document.getElementById("popupContainer2v2").style.display = "flex";
    const join2v2PopupButton = document.getElementById("join2v2ID");
    const create2v2PopupButton = document.getElementById("create2v2ID");
    const close2v2PopupButton = document.getElementById("close2v2ID");
    // CLOSE 2v2POPUP
    close2v2PopupButton.addEventListener("click", async () => {
        close2v2Popup();
    });
    // JOIN 2v2POPUP
    join2v2PopupButton.addEventListener("click", async () => {
        const matchId = document.getElementById("popup2v2MatchID").value.trim();
        if (!matchId) {
            displayWarning("Empty Match Id");
            return;
        }
        try {
            const matchData = await checkMatchExists(matchId);
            if (matchData.exists) {
                joinExistingMatch(matchId);
                showMatchId(matchId);
                closePopupPong();
            }
            else {
                displayWarning("2v2 match not found or is full");
                return;
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            displayWarning(`Error checking match: ${errorMessage}`);
        }
    });
    // CREATE 2v2POPUP
    create2v2PopupButton.addEventListener("click", async () => {
        createNewMatch(false, false, true); // teamGame = true
        close2v2Popup();
    });
}
function close2v2Popup() {
    document.getElementById("popupContainer2v2").style.display = "none";
}
