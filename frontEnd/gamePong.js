let socket = null;
let socketInitialized = false;
function startPongWebSocket() {
    if (socketInitialized)
        return;
    socketInitialized = true;
    let animationFrameId;
    let playerId = "p1";
    const keysPressed = new Set();
    // --- WebSocket Setup
    socket = new WebSocket(`ws://${window.location.hostname}:3000`);
    socket.addEventListener("open", () => {
        console.log("✅ Connected to WebSocket server");
        socket.send(JSON.stringify({ type: "hello", payload: "Client Ready" }));
    });
    socket.addEventListener("close", () => {
        console.log("❌ WebSocket connection closed");
        cancelAnimationFrame(animationFrameId); // Stop sending inputs
    });
    socket.addEventListener("error", (event) => {
        console.error("WebSocket error:", event);
    });
    // --- Game Elements
    const paddle1 = document.querySelector(".paddle1");
    const paddle2 = document.querySelector(".paddle2");
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
    // ---- Send Input to Server using requestAnimationFrame
    function sendInputLoop() {
        if (keysPressed.size > 0 && socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "input",
                playerId,
                payload: Array.from(keysPressed),
            }));
        }
        animationFrameId = requestAnimationFrame(sendInputLoop);
    }
    sendInputLoop();
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
}
// Close the WebSocket when leaving the game
function stopPongWebSocket() {
    if (socket) {
        socket.close();
        socket = null;
    }
    socketInitialized = false;
}
// Poll URL hash every 100ms (SPA-safe)
setInterval(() => {
    const isOnPongGame = window.location.hash === "#pongSingle";
    if (isOnPongGame && !socketInitialized) {
        startPongWebSocket();
    }
    else if (!isOnPongGame && socketInitialized) {
        stopPongWebSocket();
    }
}, 100);
