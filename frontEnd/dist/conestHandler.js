const joinContestButtonId = document.getElementById("joinContestId");
const createContesButtontId = document.getElementById("joinContestId");
const contestMainPage = document.getElementById("contestSelectorId");
const joinContestPage = document.getElementById("contestJoinSelectorId");
document.addEventListener("DOMContentLoaded", () => {
    joinContestButtonId.addEventListener("click", () => {
        console.log("entrou aqui no asd");
        changePageTo(contestMainPage, joinContestPage);
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
