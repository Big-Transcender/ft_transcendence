document.addEventListener("DOMContentLoaded", () => {
	const pongButton = document.getElementById("pongButton");
	const snakeButton = document.getElementById("snakeButton");
	const backGameSnakeButton = document.getElementById("backGameSnakeId");
	const backGamePongButton = document.getElementById("backGamePongId");
	const buttonSinglePong = document.getElementById("buttonSinglePong");
	const buttonMultiplayerPong = document.getElementById("buttonMultiplayerPong");

	let gameSelectorPage = document.getElementById("gameSelectorId");
	const pongGamePage = document.getElementById("pongGameId");
	const snakeGamePage = document.getElementById("SnakeGameId");
	const gameSelectorPongPage = document.getElementById("gameSelectorPongId");
	const backGameSelectorPongId = document.getElementById("backGameSelectorPongId");

	pongButton.addEventListener("click", () => {
		changePageTo(gameSelectorPage, gameSelectorPongPage);
	});

	snakeButton.addEventListener("click", () => {
		changePageTo(gameSelectorPage, snakeGamePage);
	});

	backGameSnakeButton.addEventListener("click", () => {
		changePageTo(snakeGamePage, gameSelectorPage);
	});

	backGamePongButton.addEventListener("click", () => {
		changePageTo(pongGamePage, gameSelectorPage);
	});

	buttonSinglePong.addEventListener("click", () => {
		changePageTo(gameSelectorPongPage, pongGamePage);
	});

	//Multiplayer Pong
	buttonMultiplayerPong.addEventListener("click", () => {
		changePageTo(gameSelectorPongPage, pongGamePage);
	});

	//Singleplayer Pong
	backGameSelectorPongId.addEventListener("click", () => {
		changePageTo(gameSelectorPongPage, gameSelectorPage);
		window.location.hash = "#";
		history.pushState(null, "", `#teste`);
		setTimeout(() => {
			window.location.hash = "#pong";
		}, 10);
	});
});
