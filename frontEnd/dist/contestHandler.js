const joinContestButtonId = document.getElementById("joinContestId");
const createContesButtontId = document.getElementById("joinContestId");
const genericBackButton = document.getElementById("genericBackButton");
const contestMainPage = document.getElementById("contestSelectorId");
const joinContestPage = document.getElementById("contestJoinSelectorId");
function genericBackFunction(newActiveDiv) {
    const currentActive = document.querySelector(".gameSelector.active");
    if (currentActive) {
        console.log(currentActive);
        currentActive.classList.remove("active");
    }
    newActiveDiv.classList.add("active");
}
document.addEventListener("DOMContentLoaded", () => {
    joinContestButtonId.addEventListener("click", () => {
        changePageTo(contestMainPage, joinContestPage);
    });
    genericBackButton.addEventListener("click", () => {
        // changePageTo(contestMainPage, joinContestPage);
        genericBackFunction(contestMainPage);
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
