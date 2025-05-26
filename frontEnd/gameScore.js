let player1Icon = document.getElementById("player1IconId");
let player2Icon = document.getElementById("player2IconId");
let bigScoreP1 = false;
let bigScoreP2 = false;
let turnaroundflag = false;
let playerIconMap = new Map();
playerIconMap.set("happy", "images/pongGame/playerEmotions/happy.png");
playerIconMap.set("surprise", "images/pongGame/playerEmotions/surprise.png");
playerIconMap.set("sad", "images/pongGame/playerEmotions/sad.png");
playerIconMap.set("mischief", "images/pongGame/playerEmotions/mischief.png");
playerIconMap.set("shock", "images/pongGame/playerEmotions/shock.png");
playerIconMap.set("proud", "images/pongGame/playerEmotions/proud.png");
playerIconMap.set("focus", "images/pongGame/playerEmotions/focus.png");
playerIconMap.set("laught", "images/pongGame/playerEmotions/laught.png");
// playerIconMap.set("happy", "images/pongGame/playerEmotions/happy.png");
// console.log(player1Icon);
function getEmotion() {
    const player1Score = parseInt(document.getElementById("player1ScoreId").textContent);
    const player2Score = parseInt(document.getElementById("player2ScoreId").textContent);
    if (bigScore(player1Score, player2Score) && !bigScoreP1 && !bigScoreP2) {
        if (player1Score > player2Score) {
            changeEmotion(player1Icon, "mischief");
            changeEmotion(player2Icon, "surprise");
            bigScoreP1 = true;
        }
        else {
            changeEmotion(player1Icon, "surprise");
            changeEmotion(player2Icon, "mischief");
            bigScoreP2 = true;
        }
    }
    else if (turnaround(player1Score, player2Score)) {
    }
    else if (!bigScoreP1 && !bigScoreP2 && turnaroundflag) {
        changeEmotion(player1Icon, "focus");
        changeEmotion(player2Icon, "focus");
    }
    playerWin(player1Score, player2Score);
}
function playerWin(player1Score, player2Score) {
    if (player1Score === 10) {
        changeEmotion(player1Icon, "laught");
        changeEmotion(player2Icon, "sad");
    }
    else if (player2Score === 10) {
        changeEmotion(player1Icon, "sad");
        changeEmotion(player2Icon, "laught");
    }
}
function changeEmotion(target, emotion) {
    target.src = playerIconMap.get(emotion);
}
function bigScore(player1, player2) {
    const result = Math.abs(player1 - player2);
    if (result >= 5) {
        return true;
    }
    else {
        return false;
    }
}
function turnaround(player1, player2) {
    console.log(bigScoreP2);
    if (bigScoreP1 && player2 > player1) {
        changeEmotion(player1Icon, "shock");
        changeEmotion(player2Icon, "proud");
        bigScoreP1 = false;
        turnaroundflag = true;
        return true;
    }
    else if (bigScoreP2 && player1 > player2) {
        console.log("entrou");
        changeEmotion(player1Icon, "proud");
        changeEmotion(player2Icon, "shock");
        bigScoreP1 = false;
        turnaroundflag = true;
        return true;
    }
    else {
        return false;
    }
}
document.addEventListener("keydown", (event) => {
    const key = event.key;
    if (["ArrowUp"].includes(key)) {
        // let player1Score = parseInt((document.getElementById("player1ScoreId") as HTMLImageElement).textContent);
        // player1Score += 1;
        // (document.getElementById("player1ScoreId") as HTMLImageElement).textContent = player1Score.toString();
        // console.log(player1Score);
        getEmotion();
    }
    if (["ArrowDown"].includes(key)) {
        // let player2Score = parseInt((document.getElementById("player2ScoreId") as HTMLImageElement).textContent);
        // player2Score += 1;
        // (document.getElementById("player2ScoreId") as HTMLImageElement).textContent = player2Score.toString();
        getEmotion();
    }
});
//#TODO change the point of playerScore
//You can take the player1ScoreId or player2ScoreId. Change the textContent
getEmotion();
