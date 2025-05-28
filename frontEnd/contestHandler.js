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
document.addEventListener("DOMContentLoaded", () => {
    joinContestButton.addEventListener("click", () => {
        changePageTo(contestMainPage, joinContestPage);
    });
    createContesButton.addEventListener("click", () => {
        changePageTo(contestMainPage, createContestPage);
    });
    enterContestButton.addEventListener("click", () => {
        changePageTo(joinContestPage, joinedContestPage);
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
