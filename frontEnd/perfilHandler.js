let winsNumber = document.getElementById("boxWinsNumber");
let losesNumber = document.getElementById("boxLosesNumber");
let gamesNumber = document.getElementById("boxGamesNumber");
let positionNumber = document.getElementById("positionId");
let winRateText = document.getElementById("winRateTextId");
// winsNumber.textContent = "0";
getUserPosition();
getUserWinrate();
//getUserStatus();
flipboardNumberAnimation("23", winsNumber);
async function flipboardNumberAnimation(target, targetBox) {
    targetBox.textContent = "";
    let flips = 50;
    let delay = 100;
    console.log("Teste final");
    // Inicializa todos os dígitos como "0"
    const spans = [];
    for (let i = 0; i < target.length; i++) {
        const span = document.createElement("span");
        span.textContent = "0";
        targetBox.appendChild(span);
        spans.push(span);
    }
    // Array para controlar se o dígito já acertou
    const locked = new Array(target.length).fill(false);
    for (let f = 0; f < flips; f++) {
        let allLocked = true;
        for (let i = 0; i < target.length; i++) {
            if (!locked[i]) {
                const randomDigit = Math.floor(Math.random() * 10).toString();
                spans[i].textContent = randomDigit;
                if (randomDigit === target[i]) {
                    locked[i] = true;
                }
                else {
                    allLocked = false;
                }
            }
        }
        if (allLocked)
            break;
        await new Promise((res) => setTimeout(res, delay));
    }
    // Garante que todos os dígitos finais estão corretos
    for (let i = 0; i < target.length; i++) {
        spans[i].textContent = target[i];
    }
}
function getUserPosition() {
    //TODO GET THE NICK OF THE USER, NOT THE ID
    const userId = 2;
    fetch(`http://localhost:3000/leaderboard/position/${userId}`)
        .then((response) => {
        if (!response.ok) {
            return response.json().then((err) => {
                throw new Error(err.error || "Unknown error");
            });
        }
        return response.json();
    })
        .then((data) => {
        positionNumber.textContent = data.position + "º";
        console.log(`User ${userId} is at position:`, data.position);
    })
        .catch((error) => {
        console.error("Failed to fetch leaderboard position:", error.message);
    });
}
function getUserWinrate() {
    //calulate win-rate percentage
    // let winPercentage = wins / games
    let winPercentage = 1 / 50;
    winRateText.textContent = "Current Winrate: " + (winPercentage * 100).toString() + " %";
}
// runNumberAnimation("23");
// const API_URL = "http://127.0.0.1:3000/users";
// let users = [];
// fetch(API_URL)
// 	.then((res) => res.json())
// 	.then((data) => {
// 		users = data;
// 		data.forEach((user) => {
// 			console.log(user.email);
// 		});
// 		updateWins();
// 		updateLoses();
// 		updatePlays();
// 		updateNick();
// 	});
// function updateWins() {
// 	document.getElementById("winNumberId").innerText = getWins();
// }
// function updateLoses() {
// 	document.getElementById("loseNumberId").innerText = getLoses();
// }
// function updatePlays() {
// 	document.getElementById("playNumberId").innerText = getPlays();
// }
// function updateNick() {
// 	document.getElementById("profileNickId").innerText = getNick();
// }
// function getNick() {
// 	if (users[0] === undefined) return "DEAD";
// 	return users[0].nickname;
// }
// function getWins() {
// 	if (users[0] === undefined) return "DEAD";
// 	return users[0].id;
// }
// function getLoses() {
// 	if (users[0] === undefined) return "DEAD";
// 	return users[0].loses;
// }
// function getPlays() {
// 	if (users[0] === undefined) return "DEAD";
// 	return users[0].plays;
// }
