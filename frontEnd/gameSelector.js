const pongButton = document.getElementById("pongButton");
const snakeButton = document.getElementById("snakeButton");
const backGameSnakeButton = document.getElementById("backGameSnakeId");
const backGamePongButton = document.getElementById("backGamePongId");
const buttonSinglePong = document.getElementById("buttonSinglePong");
const buttonMultiplayerPong = document.getElementById("buttonMultiplayerPong");
const gameSelectorPage = document.getElementById("gameSelectorId");
const pongGamePage = document.getElementById("pongGameId");
const snakeGamePage = document.getElementById("SnakeGameId");
const gameSelectorPongPage = document.getElementById("gameSelectorPongId");
const backGameSelectorPongId = document.getElementById("backGameSelectorPongId");
document.addEventListener("DOMContentLoaded", () => {
    pongButton.addEventListener("click", () => {
        changePageTo(gameSelectorPage, gameSelectorPongPage);
    });
    snakeButton.addEventListener("click", () => {
        changePageTo(gameSelectorPage, snakeGamePage);
    });
    //BackButton in Snake
    backGameSnakeButton.addEventListener("click", () => {
        changePageTo(snakeGamePage, gameSelectorPage);
        history.replaceState(undefined, "", "#game1");
    });
    //BackButton in Pong
    backGamePongButton.addEventListener("click", () => {
        changePageTo(pongGamePage, gameSelectorPage);
        history.replaceState(undefined, "", "#game1");
    });
    //BackButton in GameSelector
    backGameSelectorPongId.addEventListener("click", () => {
        changePageTo(gameSelectorPongPage, gameSelectorPage);
    });
    //Singleplayer Pong
    buttonSinglePong.addEventListener("click", () => {
        changePageTo(gameSelectorPongPage, pongGamePage);
        history.replaceState(undefined, "", "#pongSingle");
    });
    //Multiplayer Pong
    buttonMultiplayerPong.addEventListener("click", () => {
        changePageTo(gameSelectorPongPage, pongGamePage);
        history.replaceState(undefined, "", "#pongMulti");
    });
});
