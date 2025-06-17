// const pongButton = document.getElementById("pongButton");
const backGamePongButton = document.getElementById("backGamePongId");
const buttonSinglePong = document.getElementById("buttonSinglePong");
const buttonMultiplayerPong = document.getElementById("buttonMultiplayerPong");
const buttonVersusMP = document.getElementById("buttonVersusMPId");
const buttonLocalMP = document.getElementById("buttonLocalMP");
const backButtonMP = document.getElementById("backButtonMPId");

const pongGamePage = document.getElementById("pongGameId");
const gameSelectorPongPage = document.getElementById("gameSelectorPongId");
const gameSelectorPongMultiplayerPage = document.getElementById("gameSelectorPongMultiplayerId");
const startGameTimer = document.getElementById("timerId");
const startGameTimerBox = document.getElementById("timerBoxId");

import { startPongWebSocket } from "./gamePong.js";

async function animateTimer() {
	startGameTimerBox.style.opacity = "1";
	for (let i = 1; i <= 3; i++) {
		startGameTimer.textContent = i.toString();
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
	startGameTimerBox.style.opacity = "0";
}

function updatePageHash(hash: string) {
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
			const matchId = "match-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
			updatePageHash(`#pong/${matchId}`);
			startPongWebSocket(matchId, true, true); // true = local mode
			animateTimer();
			resetEmotions();
			setGameScore(getNickOnLocalStorage());
			backGamePongButton.classList.add("active");
		} else {
			displayWarning("You need to log in.");
		}
	});

	//Change to Multiplayer type selector
	buttonMultiplayerPong.addEventListener("click", () => {
		changePageTo(gameSelectorPongPage, gameSelectorPongMultiplayerPage);
		updatePageHash(`#pong/multiplayerMenu`);
	});

	//Change to Multiplayer Versus
	buttonVersusMP.addEventListener("click", () => {
		// changePageTo(gameSelectorPongPage, gameSelectorPage);
		updatePageHash(`#pong/pongVersusMP`);

		// // Prompt user to create or join a match
		const action = prompt("Do you want to create a new match or join an existing one? (Type 'create' or 'join')");

		if (action === "create") {
			// Create a new match
			const matchId = "match-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
			alert(`Match created! Share this ID with your friend: ${matchId}`);
			history.replaceState(undefined, "", `#pong/${matchId}`);
			startPongWebSocket(matchId, false, false); // Start as host
			changePageTo(gameSelectorPongMultiplayerPage, pongGamePage);
		} else if (action === "join") {
			// Join an existing match
			const matchId = prompt("Enter the match ID:");
			if (matchId) {
				history.replaceState(undefined, "", `#pong/${matchId}`);
				startPongWebSocket(matchId, false, false); // Join as client
				changePageTo(gameSelectorPongMultiplayerPage, pongGamePage);
			} else {
				alert("You must enter a match ID to join.");
				changePageTo(gameSelectorPongMultiplayerPage, gameSelectorPongPage);
			}
		} else {
			alert("Invalid action. Please type 'create' or 'join'.");
			changePageTo(gameSelectorPongMultiplayerPage, gameSelectorPongPage);
		}
	});

	//Change to Multiplayer Local
	buttonLocalMP.addEventListener("click", () => {
		if (checkIfLogged()) {
			changePageTo(gameSelectorPongMultiplayerPage, pongGamePage);
			const matchId = "match-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
			updatePageHash(`#pong/${matchId}`);
			startPongWebSocket(matchId, true); // true = local mode
			resetEmotions();
		} else {
			displayWarning("You need to log in.");
		}
	});

	//Back button of Multiplayer type Selector
	backButtonMP.addEventListener("click", () => {
		changePageTo(gameSelectorPongMultiplayerPage, gameSelectorPongPage);
		updatePageHash(`#pong`);
	});
});
