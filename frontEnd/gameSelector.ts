document.addEventListener("DOMContentLoaded", () => {
	const pongButton = document.getElementById("pongButton");
	const snakeButton = document.getElementById("snakeButton");
	const gameSelectorPage = document.getElementById("gameSelectorId");
	const pongGamePage = document.getElementById("pongGameId");
	const snakeGamePage = document.getElementById("SnakeGameId");

	pongButton.addEventListener("click", () => {
		changeLogginPageTo(gameSelectorPage, pongGamePage);
		console.log("entrou");
	});

	snakeButton.addEventListener("click", () => {
		changeLogginPageTo(gameSelectorPage, snakeGamePage);
		console.log("entrou");
	});
});
