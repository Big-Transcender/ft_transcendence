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

import { startPongWebSocket } from "./gamePong.js"; //TODO brendon

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

	//Singleplayer Pong #TODO brendon
	buttonSinglePong.addEventListener("click", () => {
		changePageTo(gameSelectorPongPage, pongGamePage);
		const matchId = "match-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
		history.replaceState(undefined, "", `#pong/${matchId}`);
		startPongWebSocket(matchId, true); // true = local mode
	});

	//Multiplayer Pong
	buttonMultiplayerPong.addEventListener("click", () => {
		changePageTo(gameSelectorPongPage, pongGamePage);
		history.replaceState(undefined, "", '#pong/');

		// Prompt user to create or join a match
		const action = prompt("Do you want to create a new match or join an existing one? (Type 'create' or 'join')");

		if (action === "create") {
			// Create a new match
			const matchId = "match-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
			alert(`Match created! Share this ID with your friend: ${matchId}`);
			history.replaceState(undefined, "", `#pong/${matchId}`);
			startPongWebSocket(matchId, false); // Start as host
		} else if (action === "join") {
			// Join an existing match
			const matchId = prompt("Enter the match ID:");
			if (matchId) {
				history.replaceState(undefined, "", `#pong/${matchId}`);
				startPongWebSocket(matchId, false); // Join as client
			} else {
				alert("You must enter a match ID to join.");
			}
		} else {
			alert("Invalid action. Please type 'create' or 'join'.");
		}

	});
});
