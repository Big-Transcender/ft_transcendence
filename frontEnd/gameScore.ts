let player1Icon = document.getElementById("player1IconId") as HTMLImageElement;
let player1IconContest = document.querySelector(".player1ScoreContest") as HTMLImageElement;
let player2Icon = document.getElementById("player2IconId") as HTMLImageElement;
let player2IconContest = document.querySelector(".player2ScoreContest") as HTMLImageElement;
let player1ScoreText = (document.getElementById("player1ScoreId") as HTMLImageElement).textContent;
let player2ScoreText = (document.getElementById("player2ScoreId") as HTMLImageElement).textContent;

let bigScoreP1 = false;
let bigScoreP2 = false;
let turnaroundflag = false;

let playerIconMap = new Map<string, string>();

playerIconMap.set("happy", "images/pongGame/playerEmotions/happy.png");
playerIconMap.set("surprise", "images/pongGame/playerEmotions/surprise.png");
playerIconMap.set("sad", "images/pongGame/playerEmotions/sad.png");
playerIconMap.set("mischief", "images/pongGame/playerEmotions/mischief.png");
playerIconMap.set("shock", "images/pongGame/playerEmotions/shock.png");
playerIconMap.set("proud", "images/pongGame/playerEmotions/proud.png");
playerIconMap.set("focus", "images/pongGame/playerEmotions/focus.png");
playerIconMap.set("laught", "images/pongGame/playerEmotions/laught.png");

function getEmotion() {
	const player1Score = parseInt((document.getElementById("player1ScoreId") as HTMLImageElement).textContent);
	const player2Score = parseInt((document.getElementById("player2ScoreId") as HTMLImageElement).textContent);

	if (bigScore(player1Score, player2Score) && !bigScoreP1 && !bigScoreP2) {
		if (player1Score > player2Score) {
			changeEmotion(player1Icon, "mischief");
			player1IconContest;
			changeEmotion(player2Icon, "surprise");
			player2IconContest;
			bigScoreP1 = true;
		} else {
			changeEmotion(player1Icon, "surprise");
			player1IconContest;
			changeEmotion(player2Icon, "mischief");
			player2IconContest;
			bigScoreP2 = true;
		}
	} else if (turnaround(player1Score, player2Score)) {
	} else if (!bigScoreP1 && !bigScoreP2 && turnaroundflag) {
		changeEmotion(player1Icon, "focus");
		player1IconContest;
		changeEmotion(player2Icon, "focus");
		player2IconContest;
	}

	playerWin(player1Score, player2Score);
}

function playerWin(player1Score, player2Score) {
	if (player1Score === 10) {
		changeEmotion(player1Icon, "laught");
		changeEmotion(player1IconContest, "laught");
		changeEmotion(player2Icon, "sad");
		changeEmotion(player2IconContest, "sad");
	} else if (player2Score === 10) {
		changeEmotion(player1Icon, "sad");
		changeEmotion(player1IconContest, "sad");
		changeEmotion(player2Icon, "laught");
		changeEmotion(player2IconContest, "laught");
	}
}

function changeEmotion(target, emotion: string) {
	target.src = playerIconMap.get(emotion);
}

function bigScore(player1, player2) {
	const result = Math.abs(player1 - player2);

	if (result >= 5) {
		return true;
	} else {
		return false;
	}
}

function turnaround(player1, player2) {
	if (bigScoreP1 && player2 > player1) {
		changeEmotion(player1Icon, "shock");
		changeEmotion(player1IconContest, "shock");
		changeEmotion(player2Icon, "proud");
		changeEmotion(player2IconContest, "proud");
		bigScoreP1 = false;
		turnaroundflag = true;
		return true;
	} else if (bigScoreP2 && player1 > player2) {
		changeEmotion(player1Icon, "proud");
		changeEmotion(player1IconContest, "proud");
		changeEmotion(player2Icon, "shock");
		changeEmotion(player2IconContest, "shock");
		bigScoreP1 = false;
		turnaroundflag = true;
		return true;
	} else {
		return false;
	}
}

function resetEmotions() {
	bigScoreP1 = false;
	bigScoreP2 = false;
	turnaroundflag = false;
	changeEmotion(player1Icon, "happy");
	changeEmotion(player1IconContest, "happy");
	changeEmotion(player2Icon, "happy");
	changeEmotion(player1IconContest, "happy");
	(document.getElementById("player1ScoreId") as HTMLElement).textContent = "0";
	(document.getElementById("player2ScoreId") as HTMLElement).textContent = "0";
	(document.querySelector(".player1ScoreContest") as HTMLElement).textContent = "0";
	(document.querySelector(".player2ScoreContest") as HTMLElement).textContent = "0";
}

function setGameScore(name1: string, name2: string = "Bot") {
	let player1Nick = document.getElementById("player1NickId") as HTMLImageElement;
	let player1NickContest = document.querySelector(".player1NickContest") as HTMLImageElement;

	let player2Nick = document.getElementById("player2NickId") as HTMLImageElement;
	let player2NickContest = document.querySelector(".player2NickContest") as HTMLImageElement;

	player1Nick.textContent = name1;
	player1NickContest.textContent = name1;
	player2Nick.textContent = name2;
	player2NickContest.textContent = name2;
}

let state2: any;

window.addEventListener("gameStateUpdate", (event: CustomEvent) => {
	state2 = event.detail;
	if (state2) {
		(document.getElementById("player1ScoreId") as HTMLImageElement).textContent = state2.score.p1;
		(document.getElementById("player2ScoreId") as HTMLImageElement).textContent = state2.score.p2;
		(document.querySelector(".player1ScoreContest") as HTMLImageElement).textContent = state2.score.p1;
		(document.querySelector(".player2ScoreContest") as HTMLImageElement).textContent = state2.score.p2;
		getEmotion();
	}
});
