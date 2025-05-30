const joinContestButton = document.getElementById("joinContestId");
const createContesButton = document.getElementById("createContestId");
const enterContestButton = document.getElementById("enterContestButtonId");
const genericBackButton = document.querySelectorAll(".genericBackButton");
const contestMainPage = document.getElementById("contestSelectorId");
const joinContestPage = document.getElementById("contestJoinSelectorId");
const joinedContestPage = document.getElementById("contestJoinedSelectorId");
const createContestPage = document.getElementById("contestCreateSelectorId");
const pinBox = document.querySelector(".contestPinBox");
function genericBackFunctionContest() {
    const currentActive = document.querySelector(".contestId.active");
    if (currentActive) {
        currentActive.classList.remove("active");
        if (currentActive.id === "contestJoinSelectorId") {
            contestMainPage.classList.add("active");
        }
        else if (currentActive.id === "contestJoinedSelectorId") {
            joinContestPage.classList.add("active");
        }
    }
}
let isPlaying = false;
async function displayWarning(text) {
    const warningBubble = document.querySelector(".defaultWarning");
    const warningText = document.getElementById("warningContest");
    if (!isPlaying) {
        isPlaying = true;
        warningText.textContent = text;
        warningBubble.classList.add("warning");
        await new Promise((resolve) => {
            setTimeout(resolve, 5000);
        });
        warningBubble.classList.remove("warning");
        isPlaying = false;
    }
}
async function betterWait(time) {
    await new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}
document.addEventListener("DOMContentLoaded", () => {
    //Enter Join Page
    joinContestButton.addEventListener("click", async () => {
        if (!checkIfLogged()) {
            displayWarning("You need to log in.");
        }
        else {
            await betterWait(100);
            changePageTo(contestMainPage, joinContestPage);
        }
    });
    //Enter create Contest Page
    createContesButton.addEventListener("click", async () => {
        if (!checkIfLogged()) {
            displayWarning("You need to log in.");
        }
        else {
            await betterWait(100);
            changePageTo(contestMainPage, createContestPage);
        }
    });
    //Enter Contest Players Page
    enterContestButton.addEventListener("click", async () => {
        const inputPin = document.getElementById("inputPin").value.trim();
        if (!inputPin.length) {
            displayWarning("Invalid pin.");
        }
        else if (await checkIsValidPin(inputPin)) {
            await betterWait(100);
            changePageTo(joinContestPage, joinedContestPage);
            getInfoFromContest(inputPin);
        }
    });
    genericBackButton.forEach((button) => {
        button.addEventListener("click", () => {
            genericBackFunctionContest();
        });
    });
    //BackButton in Pong
    // backGamePongButton.addEventListener("click", () => {
    // 	changePageTo(pongGamePage, gameSelectorPage);
    // 	history.replaceState(undefined, "", "#game1");
    // });
    // //BackButton in GameSelector
    // backGameSelectorPongId.addEventListener("click", () => {
    // 	changePageTo(gameSelectorPongPage, gameSelectorPage);
    // });
    // //Singleplayer Pong
    // buttonSinglePong.addEventListener("click", () => {
    // 	changePageTo(gameSelectorPongPage, pongGamePage);
    // 	history.replaceState(undefined, "", "#pongSingle");
    // 	resetEmotions();
    // });
    // //Multiplayer Pong
    // buttonMultiplayerPong.addEventListener("click", () => {
    // 	changePageTo(gameSelectorPongPage, pongGamePage);
    // 	history.replaceState(undefined, "", "#pongMulti");
    // });
});
if (pinBox) {
    pinBox.addEventListener("click", () => {
        const pinNumber = pinBox.querySelector(".contestPinBoxNumber");
        if (pinNumber) {
            const range = document.createRange();
            range.selectNodeContents(pinNumber);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });
}
// function placeNameInContest() {
// }
async function getInfoFromContest(pin) {
    try {
        const response = await fetch(`http://localhost:3000/tournament/${pin}`);
        const data = await response.json();
        const playerPlaces = document.querySelectorAll(".playerContestPlace");
        let pinNumber = document.getElementById("contestPinBoxNumberId");
        let name = document.getElementById("contestNameId");
        // console.log(data.matches);
        let matches = data.matches;
        for (let i = 0; i < playerPlaces.length; i++) {
            if (playerPlaces[i].classList.contains("noplayer")) {
                const playerName = playerPlaces[i].querySelector(".playerContestPlaceName");
                const playerBG = playerPlaces[i].querySelector(".playerContestPlaceBG");
                playerName.textContent = getNickOnLocalStorage();
                playerPlaces[i].classList.remove("noplayer");
                playerBG.classList.remove("noGame");
                break;
            }
        }
        pinNumber.textContent = data.id;
        name.textContent = data.name;
        return true;
    }
    catch (err) {
        console.error("Failed to check pin:", err);
        return false;
    }
}
async function checkIsValidPin(pin) {
    try {
        const response = await fetch(`http://localhost:3000/tournament/${pin}`);
        const data = await response.json();
        if (response.ok) {
            return true;
        }
        else {
            displayWarning("No contest with this pin");
            return false;
        }
    }
    catch (err) {
        console.error("Failed to check pin:", err);
        return false;
    }
}
