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
	const board = document.querySelector(".board") as HTMLElement;

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
	const timer = document.querySelector(".timer") as HTMLElement;
	if (!timer) return;
	timer.style.opacity = "1";
	timer.style.animation = "timerAnimation 3s";

	// Remove a animação após terminar para poder reutilizar depois
	setTimeout(() => {
		timer.style.animation = "";
		timer.style.opacity = "0";
	}, 3000);
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
			const matchId = generateMatchId();
			updatePageHash(`#pong/${matchId}`);
			startPongWebSocket(matchId, true, true); // true = local mode
			animateTimer();
			setRandomBackground();
			resetEmotions();
			setGameScore(getNickOnLocalStorage());
			backGamePongButton.classList.add("active");
			showMatchId("NONE");
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
	buttonVersusMP.addEventListener("click", async () => {
		// changePageTo(gameSelectorPongPage, gameSelectorPage);
		// updatePageHash(`#pong/pongVersusMP`);
		//#TODO Check this Hash update, it realy update over here?

		// // Prompt user to create or join a match
		// const action = prompt("Do you want to create a new match or join an existing one? (Type 'create' or 'join')");

		/*if (action === "create") {
			createNewMatch()
		}

		else if (action === "join") {
			const matchId = prompt("Enter the match ID:");
			
			if (!matchId?.trim()) {
				showErrorAndReturn("Please enter a valid match ID.");
				return;
			}
			try {
				
				const matchData = await checkMatchExists(matchId);
				if (matchData.exists) {
					joinExistingMatch(matchId);
				} else {
					showErrorAndReturn("Match not found or is full.");
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				showErrorAndReturn(`Error checking match: ${errorMessage}`);
			}
		}
		 else {
			alert("Invalid action. Please type 'create' or 'join'.");
			changePageTo(gameSelectorPongMultiplayerPage, gameSelectorPongPage);
		}*/
		openPopupPong();

		// if (action === "create") {
		// 	// Create a new match
		// 	const matchId = generateMatchId();
		// 	alert(`Match created! Share this ID with your friend: ${matchId}`);
		// 	history.replaceState(undefined, "", `#pong/${matchId}`);
		// 	startPongWebSocket(matchId, false, false); // Start as host
		// 	changePageTo(gameSelectorPongMultiplayerPage, pongGamePage);
		// 	backGamePongButton.classList.add("active");
		// 	animateTimer();
		// 	resetEmotions();
		// } else if (action === "join") {
		// 	// Join an existing match
		// 	const matchId = prompt("Enter the match ID:");
		// 	if (matchId) {
		// 		history.replaceState(undefined, "", `#pong/${matchId}`);
		// 		startPongWebSocket(matchId, false, false); // Join as client
		// 		changePageTo(gameSelectorPongMultiplayerPage, pongGamePage);
		// 		backGamePongButton.classList.add("active");
		// 		animateTimer();
		// 		resetEmotions();
		// 		setGameScore("Player 1", getNickOnLocalStorage());
		// 	} else {
		// 		alert("You must enter a match ID to join.");
		// 		changePageTo(gameSelectorPongMultiplayerPage, gameSelectorPongPage);
		// 	}
		// } else {
		// 	alert("Invalid action. Please type 'create' or 'join'.");
		// 	changePageTo(gameSelectorPongMultiplayerPage, gameSelectorPongPage);
		// }
	});

	//Change to Multiplayer Local
	buttonLocalMP.addEventListener("click", () => {
		if (checkIfLogged()) {
			changePageTo(gameSelectorPongMultiplayerPage, pongGamePage);
			const matchId = generateMatchId();
			updatePageHash(`#pong/${matchId}`);
			startPongWebSocket(matchId, true); // true = local mode
			resetEmotions();
			animateTimer();
			setGameScore(getNickOnLocalStorage(), "Player 2");
			backGamePongButton.classList.add("active");
			showMatchId("NONE");
		} else {
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




async function checkMatchExists(matchId: string): Promise<MatchCheckResponse> {
	const response = await fetch(`${backendUrl}/pongGame/${matchId}/exists`);
	
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	
	return response.json();
}

function joinExistingMatch(matchId: string): void {
	history.replaceState(undefined, "", `#pong/${matchId}`);
	startPongWebSocket(matchId);
	changePageTo(gameSelectorPongMultiplayerPage, pongGamePage);
	backGamePongButton.classList.add("active");
	animateTimer();
	resetEmotions();
	setGameScore("Player 1", getNickOnLocalStorage());
}

function createNewMatch(isLocal: boolean = false, aiGame: boolean = false, teamGame: boolean = false): void
{
	const matchId = generateMatchId()
	alert(`Match created! Share this ID with your friend: ${matchId}`);
	history.replaceState(undefined, "", `#pong/${matchId}`);
	startPongWebSocket(matchId, isLocal, aiGame, teamGame); // Start as host
	changePageTo(gameSelectorPongMultiplayerPage, pongGamePage);
	backGamePongButton.classList.add("active");
	animateTimer();
	resetEmotions();
}

function showErrorAndReturn(message: string): void {
	alert(message);
	changePageTo(gameSelectorPongMultiplayerPage, gameSelectorPongPage);
}
function showMatchId(matchIdText: string) {
	document.querySelector(".gameIdBoxTextID").textContent = matchIdText;
	(document.querySelector(".gameIdBox") as HTMLElement).style.opacity = "1";
}

function openPopupPong() {
	document.getElementById("popupContainerPong").style.display = "flex";

	// CREATE A MP MATCH
	createPopupButton.addEventListener("click", () => {
		// #TODO This match ID >NEEDS< to be smaller
		// 4 characters should be more than enough
		const matchId = generateMatchId();
		showMatchId(matchId);
		history.replaceState(undefined, "", `#pong/${matchId}`);
		startPongWebSocket(matchId, false, false); // Start as host
		changePageTo(gameSelectorPongMultiplayerPage, pongGamePage);
		backGamePongButton.classList.add("active");
		// animateTimer();
		resetEmotions();
		closePopupPong();
		setGameScore(getNickOnLocalStorage(), "Player 2");
		// changePageTo(pongGamePage, gameSelectorPongPage);
		// updatePageHash("#game1");
		// backGamePongButton.classList.remove("active");
	});

	// CREATE 2v2 MATCH
	create2V2PopupButton.addEventListener("click", () => {
		//#TODO This is the 2v2 match buttom. Do what you wish
		//Remember to use "closePopupPong()" to close the popup!
		displayWarning("This start the 2v2 match!");
	});

	// JOIN A MP MATCH
	joinPopupButton.addEventListener("click", () => {
		// Join an existing match
		const matchId = (document.getElementById("popupMatchID") as HTMLInputElement).value.trim();
		// #TODO If it's an incorrect MatchID, nothing will happen, but an error should be displayed.
		if (matchId) {
			history.replaceState(undefined, "", `#pong/${matchId}`);
			startPongWebSocket(matchId, false, false); // Join as client
			changePageTo(gameSelectorPongMultiplayerPage, pongGamePage);
			backGamePongButton.classList.add("active");
			animateTimer();
			resetEmotions();
			setGameScore("Player 1", getNickOnLocalStorage());
			showMatchId(matchId);
			closePopupPong();
		} else {
			displayWarning("You must enter a match ID to join.");
			// alert("You must enter a match ID to join.");
			// changePageTo(gameSelectorPongMultiplayerPage, gameSelectorPongPage);
		}
	});
}

function closePopupPong() {
	document.getElementById("popupContainerPong").style.display = "none";
}
