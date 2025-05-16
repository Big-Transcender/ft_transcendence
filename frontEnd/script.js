const page = document.getElementById("home");
function navigate(page) {
    if (document.getElementById(page).classList.contains("active")) {
        return;
    }
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    document.getElementById(page).classList.add("active");
    history.pushState(null, "", `#${page}`);
    // getWins();
    // updateLoses();
    // updatePlays();
    // updateWins();
}
window.addEventListener("popstate", () => {
    const page = location.hash.replace("#", "") || "home";
    navigate(page);
});
window.addEventListener("load", () => {
    const page = location.hash.replace("#", "") || "home";
    navigate(page);
});
const buttons = document.querySelectorAll(".buttonHitBox");
const div = document.querySelector(".buttonBG");
let mouseIn = false;
const buttonSoundIn = new Audio("audios/in.wav");
const buttonSoundOut = new Audio("audios/out.wav");
const musicMenuIn = new Audio("audios/musicMenuIn.wav");
const musicMenuOut = new Audio("audios/musicMenuOut.wav");
const musicMenu = document.querySelector(".musicPlayerBg");
let musicIn = false;
// bgMusic.play()
buttons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
        if (!mouseIn) {
            buttonSoundIn.play();
            mouseIn = true;
            // console.log("teste1");
        }
    });
    button.addEventListener("mouseleave", () => {
        if (mouseIn) {
            buttonSoundOut.play();
            // console.log("teste2");
            mouseIn = false;
        }
    });
});
musicMenu.addEventListener("mouseenter", () => {
    if (!musicIn) {
        musicMenuIn.play();
        musicIn = true;
    }
});
musicMenu.addEventListener("mouseleave", () => {
    if (musicIn) {
        musicMenuOut.play();
        musicIn = false;
    }
});
// console.log(bgMusic.title);
// botao.addEventListener('mouseenter', () => {
// 	jaPassou = true;
// });
// botao.addEventListener('mouseleave', () => {
// 	if (jaPassou) {
// 		div.classList.add('animar');
// 		console.log("entrou");
// 		// Se quiser remover depois de um tempo:
// 		// setTimeout(() => {
// 		//   div.classList.remove('animar');
// 		// }, 1000);
// 	}
// });
// --- WebSocket Setup
const socket = new WebSocket(`ws://${window.location.hostname}:3000`);
socket.addEventListener("open", () => {
    console.log("✅ Connected to WebSocket server");
    socket.send(JSON.stringify({ type: "hello", payload: "Client Ready" }));
});
socket.addEventListener("close", () => {
    console.log("❌ WebSocket connection closed");
});
socket.addEventListener("error", (event) => {
    console.error("WebSocket error:", event);
});
// --- Game Elements
let playerId = 'p1';
const paddle1 = document.querySelector(".paddle1");
const paddle2 = document.querySelector(".paddle2");
const ball = document.querySelector(".ball");
// --- Input State
const keysPressed = new Set();
document.addEventListener("keydown", (event) => {
    const key = event.key;
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(key)) {
        keysPressed.add(key);
    }
});
document.addEventListener("keyup", (event) => {
    const key = event.key;
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(key)) {
        keysPressed.delete(key);
    }
});
// ---- Send Input to Server
setInterval(() => {
    if (keysPressed.size > 0) {
        socket.send(JSON.stringify({
            type: "input",
            playerId, // send the current player's ID
            payload: Array.from(keysPressed),
        }));
    }
}, 15);
// ---- Receive Server Messages
socket.addEventListener("message", (event) => {
    try {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case "state": {
                const state = data.payload;
                if (paddle1)
                    paddle1.style.top = `${state.paddles.p1}%`;
                if (paddle2)
                    paddle2.style.top = `${state.paddles.p2}%`;
                if (ball) {
                    ball.style.left = `${state.ball.x}%`;
                    ball.style.top = `${state.ball.y}%`;
                }
                break;
            }
            case "assign": {
                playerId = data.payload;
                console.log(`👤 You are assigned as ${playerId}`);
                break;
            }
        }
    }
    catch (err) {
        console.error("❗ Invalid JSON from server:", event.data);
    }
});
