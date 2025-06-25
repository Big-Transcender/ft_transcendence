let socket = null;
let socketInitialized = false;
let currentMatchId = null;
let currentIsLocal = true;
export function startPongWebSocket(matchId, isLocal, aiGame = false, teamGame = false) {
    if (socketInitialized)
        return;
    socketInitialized = true;
    currentMatchId = matchId;
    currentIsLocal = isLocal;
    let animationFrameId;
    let playerId = "p1";
    const keysPressed = new Set();
    // --- WebSocket Setup
    socket = new WebSocket(`ws://${window.location.hostname}:3000`);
    const nickname = getNickOnLocalStorage();
    socket.addEventListener("open", () => {
        console.log("✅ Connected to WebSocket server");
        socket.send(JSON.stringify({
            type: "join",
            matchId: matchId,
            isLocal: isLocal,
            aiGame: aiGame,
            nickname: nickname,
            teamGame: teamGame,
        }));
    });
    socket.addEventListener("close", () => {
        console.log("❌ WebSocket connection closed");
        cancelAnimationFrame(animationFrameId);
    });
    socket.addEventListener("error", (event) => {
        console.error("WebSocket error:", event);
    });
    // --- Game Elements
    const paddle1 = document.querySelector(".paddle1");
    const paddle2 = document.querySelector(".paddle2");
    const paddle3 = document.querySelector(".paddle3");
    const paddle4 = document.querySelector(".paddle4");
    const ball = document.querySelector(".ball");
    // --- Input Handling
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
    // ---- Sending player inputs to server
    function sendInputLoop() {
        if (keysPressed.size > 0 && socket && socket.readyState === WebSocket.OPEN && currentMatchId) {
            socket.send(JSON.stringify({
                type: "input",
                matchId: currentMatchId,
                playerId,
                payload: Array.from(keysPressed),
            }));
        }
        animationFrameId = requestAnimationFrame(sendInputLoop);
    }
    sendInputLoop();
    // ---- Receiving Server updated positions
    if (!teamGame) {
        paddle3.classList.add('offPaddle');
        paddle4.classList.add('offPaddle');
    }
    else {
        paddle3.classList.remove('offPaddle');
        paddle4.classList.remove('offPaddle');
    }
    socket.addEventListener("message", (event) => {
        try {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case "state": {
                    const state = data.payload;
                    window.dispatchEvent(new CustomEvent("gameStateUpdate", { detail: state }));
                    if (paddle1) {
                        paddle1.style.top = `${state.paddles.p1}%`;
                    }
                    if (paddle2) {
                        paddle2.style.top = `${state.paddles.p2}%`;
                    }
                    if (paddle3 && teamGame) {
                        paddle3.style.top = `${state.paddles.p3}%`;
                    }
                    if (paddle4 && teamGame) {
                        paddle4.style.top = `${state.paddles.p4}%`;
                    }
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
                case "gameOver": {
                    const { winner, reason } = data.payload;
                    //console.log(`Game Over! Winner: ${winner}, Reason: ${reason}`);
                    if (winner) {
                        console.log(`Game Over! The winner is ${winner}. Reason: ${reason}`);
                        alert(`Game Over! The winner is ${winner}. Reason: ${reason}`);
                    }
                    else {
                        console.log(`Game Over! Reason: ${reason}`);
                        alert(`Game Over! Reason: ${reason}`);
                    }
                    break;
                }
            }
        }
        catch (err) {
            console.error("❗ Invalid JSON from server:", event.data);
        }
    });
}
// Close the WebSocket when leaving the game
function stopPongWebSocket() {
    if (socket) {
        socket.close();
        socket = null;
    }
    socketInitialized = false;
    currentMatchId = null;
}
setInterval(() => {
    const hash = window.location.hash;
    const matchPrefix = "#pong/";
    const isOnPongGame = hash.startsWith(matchPrefix) && hash.slice(matchPrefix.length) === currentMatchId;
    if (!isOnPongGame && socketInitialized) {
        stopPongWebSocket();
    }
}, 100);
