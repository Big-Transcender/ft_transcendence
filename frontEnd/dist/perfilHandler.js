let winsNumber = document.getElementById("boxWinsNumber");
let losesNumber = document.getElementById("boxLosesNumber");
let gamesNumber = document.getElementById("boxGamesNumber");
let positionNumber = document.getElementById("positionId");
let winRateText = document.getElementById("winRateTextId");
getUserStats(getNickOnLocalStorage());
async function flipboardNumberAnimation(target, targetBox) {
    targetBox.textContent = "";
    let flips = 50;
    let delay = 100;
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
    const userNick = localStorage.getItem("nickname");
    fetch(`http://localhost:3000/leaderboard/position/${userNick}`)
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
        console.log(`User ${userNick} is at position:`, data.position);
    })
        .catch((error) => {
        console.error("Failed to fetch leaderboard position:", error.message);
    });
}
async function getUserStats(nickname) {
    fetch(`http://localhost:3000/player-stats/${nickname}`)
        .then((response) => {
        if (!response.ok) {
            return response.json().then((err) => {
                throw new Error(err.error || "Unknown error");
            });
        }
        return response.json();
    })
        .then((stats) => {
        flipboardNumberAnimation(stats.wins.toString(), winsNumber);
        flipboardNumberAnimation(stats.defeats.toString(), losesNumber);
        flipboardNumberAnimation(stats.games_played.toString(), gamesNumber);
        winRateText.textContent = "Current Winrate: " + stats.win_percentage;
        getUserPosition();
    })
        .catch((error) => {
        console.error("Failed to fetch player stats:", error.message);
    });
}
