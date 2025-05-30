const pongButton = document.getElementById("pongButton");
const snakeButton = document.getElementById("snakeButton");
const backGameSnakeButton = document.getElementById("backGameSnakeId");
const backGamePongButton = document.getElementById("backGamePongId");
const buttonSinglePong = document.getElementById("buttonSinglePong");
const buttonMultiplayerPong = document.getElementById("buttonMultiplayerPong");
const buttonVersusMP = document.getElementById("buttonVersusMPId");
const buttonLocalMP = document.getElementById("buttonLocalMP");
const backButtonMP = document.getElementById("backButtonMPId");
const gameSelectorPage = document.getElementById("gameSelectorId");
const pongGamePage = document.getElementById("pongGameId");
const snakeGamePage = document.getElementById("SnakeGameId");
const gameSelectorPongPage = document.getElementById("gameSelectorPongId");
const gameSelectorPongMultiplayerPage = document.getElementById("gameSelectorPongMultiplayerId");
const backGameSelectorPongId = document.getElementById("backGameSelectorPongId");
import { startPongWebSocket } from "./gamePong.js"; //TODO brendon
function updatePageHash(hash) {
    history.replaceState(undefined, "", hash);
}
document.addEventListener("DOMContentLoaded", () => {
    pongButton.addEventListener("click", async () => {
        if (checkIfLogged()) {
            changePageTo(gameSelectorPage, gameSelectorPongPage);
            updatePageHash("#pong");
        }
        else {
            displayWarning("You need to log in.");
        }
    });
    snakeButton.addEventListener("click", () => {
        if (checkIfLogged()) {
            changePageTo(gameSelectorPage, snakeGamePage);
            updatePageHash("#snake");
        }
        else {
            displayWarning("You need to log in.");
        }
    });
    //BackButton in Snake
    backGameSnakeButton.addEventListener("click", () => {
        changePageTo(snakeGamePage, gameSelectorPage);
        updatePageHash("#game1");
    });
    //BackButton in Pong
    backGamePongButton.addEventListener("click", () => {
        changePageTo(pongGamePage, gameSelectorPage);
        updatePageHash("#game1");
    });
    //BackButton in GameSelector
    backGameSelectorPongId.addEventListener("click", () => {
        changePageTo(gameSelectorPongPage, gameSelectorPage);
        updatePageHash("#game1");
    });
    //Singleplayer Pong
    buttonSinglePong.addEventListener("click", () => {
        changePageTo(gameSelectorPongPage, pongGamePage);
        const matchId = "match-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
        updatePageHash(`#pong/${matchId}`);
        startPongWebSocket(matchId, true); // true = local mode
        resetEmotions();
    });
    //Change to Multiplayer type selector
    buttonMultiplayerPong.addEventListener("click", () => {
        changePageTo(gameSelectorPongPage, gameSelectorPongMultiplayerPage);
        updatePageHash(`#pong/multiplayerMenu`);
        // // Prompt user to create or join a match
        // const action = prompt("Do you want to create a new match or join an existing one? (Type 'create' or 'join')");
        // if (action === "create") {
        // 	// Create a new match
        // 	const matchId = "match-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
        // 	alert(`Match created! Share this ID with your friend: ${matchId}`);
        // 	history.replaceState(undefined, "", `#pong/${matchId}`);
        // 	startPongWebSocket(matchId, false); // Start as host
        // } else if (action === "join") {
        // 	// Join an existing match
        // 	const matchId = prompt("Enter the match ID:");
        // 	if (matchId) {
        // 		history.replaceState(undefined, "", `#pong/${matchId}`);
        // 		startPongWebSocket(matchId, false); // Join as client
        // 	} else {
        // 		alert("You must enter a match ID to join.");
        // 	}
        // } else {
        // 	alert("Invalid action. Please type 'create' or 'join'.");
        // }
        //Change to Multiplayer Versus
        buttonVersusMP.addEventListener("click", () => {
            // changePageTo(gameSelectorPongPage, gameSelectorPage);
            updatePageHash(`#pong/pongVersusMP`);
        });
        //Change to Multiplayer Local
        buttonLocalMP.addEventListener("click", () => {
            // changePageTo(gameSelectorPongPage, gameSelectorPage);
            updatePageHash(`#pong/pongLocalMP`);
        });
        //Back button of Multiplayer type Selector
        backButtonMP.addEventListener("click", () => {
            changePageTo(gameSelectorPongMultiplayerPage, gameSelectorPongPage);
            updatePageHash(`#pong`);
        });
    });
});
