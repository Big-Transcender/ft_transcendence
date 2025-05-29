const joinContestButton = document.getElementById("joinContestId");
const createContesButton = document.getElementById("createContestId");
const enterContestButton = document.getElementById("enterContestButtonId");
const genericBackButton = document.querySelectorAll(".genericBackButton");
const contestMainPage = document.getElementById("contestSelectorId");
const joinContestPage = document.getElementById("contestJoinSelectorId");
const joinedContestPage = document.getElementById("contestJoinedSelectorId");
const createContestPage = document.getElementById("contestCreateSelectorId");
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
document.addEventListener("DOMContentLoaded", () => {
    joinContestButton.addEventListener("click", () => {
        if (!checkIfLogged()) {
            displayWarning("You need to log in.");
        }
        else {
            changePageTo(contestMainPage, joinContestPage);
        }
    });
    createContesButton.addEventListener("click", () => {
        if (!checkIfLogged()) {
            displayWarning("You need to log in.");
        }
        else {
            changePageTo(contestMainPage, createContestPage);
        }
    });
    //Enter Pin Page
    enterContestButton.addEventListener("click", async () => {
        const inputPin = document.getElementById("inputPin").value.trim();
        if (!inputPin.length) {
            displayWarning("Invalid pin.");
        }
        else if (await checkIsValidPin(inputPin)) {
            changePageTo(joinContestPage, joinedContestPage);
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
        displayWarning("Erro ao verificar o pin");
        return false;
    }
}
