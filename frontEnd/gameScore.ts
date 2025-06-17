let player1Icon = document.getElementById("player1IconId") as HTMLImageElement;
let player2Icon = document.getElementById("player2IconId") as HTMLImageElement;
let player1ScoreText = (document.getElementById("player1ScoreId") as HTMLImageElement).textContent;
let player2ScoreText = (document.getElementById("player2ScoreId") as HTMLImageElement).textContent;
let player1Nick = document.getElementById("player1NickId") as HTMLImageElement;
let player2Nick = document.getElementById("player2NickId") as HTMLImageElement;
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
			changeEmotion(player2Icon, "surprise");
			bigScoreP1 = true;
		} else {
			changeEmotion(player1Icon, "surprise");
			changeEmotion(player2Icon, "mischief");
			bigScoreP2 = true;
		}
	} else if (turnaround(player1Score, player2Score)) {
	} else if (!bigScoreP1 && !bigScoreP2 && turnaroundflag) {
		changeEmotion(player1Icon, "focus");
		changeEmotion(player2Icon, "focus");
	}

	playerWin(player1Score, player2Score);
}

function playerWin(player1Score, player2Score) {
	if (player1Score === 10) {
		changeEmotion(player1Icon, "laught");
		changeEmotion(player2Icon, "sad");
	} else if (player2Score === 10) {
		changeEmotion(player1Icon, "sad");
		changeEmotion(player2Icon, "laught");
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
		changeEmotion(player2Icon, "proud");
		bigScoreP1 = false;
		turnaroundflag = true;
		return true;
	} else if (bigScoreP2 && player1 > player2) {
		console.log("entrou");
		changeEmotion(player1Icon, "proud");
		changeEmotion(player2Icon, "shock");
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
	changeEmotion(player2Icon, "happy");
}

function setGameScore(name1: string, name2: string = "Bot") {
	player1Nick.textContent = name1;
	player2Nick.textContent = name2;
}

let state2: any;

window.addEventListener("gameStateUpdate", (event: CustomEvent) => {
	state2 = event.detail;
	if (state2) {
		(document.getElementById("player1ScoreId") as HTMLImageElement).textContent = state2.score.p1;
		(document.getElementById("player2ScoreId") as HTMLImageElement).textContent = state2.score.p2;
		getEmotion();
	}
});
