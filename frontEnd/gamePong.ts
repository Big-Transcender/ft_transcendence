let socket: WebSocket | null = null;
let socketInitialized = false;
let currentMatchId: string | null = null;
let currentIsLocal: boolean = true;

export function startPongWebSocket(matchId: string, isLocal: boolean) {
	if (socketInitialized)
		return;
	socketInitialized = true;
	currentMatchId = matchId;
	currentIsLocal = isLocal;

	let animationFrameId: number;
	let playerId: "p1" | "p2" = "p1";
	const keysPressed = new Set<string>();

	// --- WebSocket Setup
	socket = new WebSocket(`ws://${window.location.hostname}:3000`);

	socket.addEventListener("open", () => {
		console.log("✅ Connected to WebSocket server");
		socket.send(JSON.stringify({
			type: "join",
			matchId: matchId,
			isLocal: isLocal
		}));
	});

	socket.addEventListener("close", () => {
		console.log("❌ WebSocket connection closed");
		cancelAnimationFrame(animationFrameId); // Stop sending inputs
	});

	socket.addEventListener("error", (event: Event) => {
		console.error("WebSocket error:", event);
	});

	// --- Game Elements
	const paddle1 = document.querySelector(".paddle1") as HTMLElement;
	const paddle2 = document.querySelector(".paddle2") as HTMLElement;
	const ball = document.querySelector(".ball") as HTMLElement;

	// --- Input Handling
	document.addEventListener("keydown", (event: KeyboardEvent) => {
		const key = event.key;
		if (["ArrowUp", "ArrowDown", "w", "s"].includes(key)) {
			keysPressed.add(key);
		}
	});

	document.addEventListener("keyup", (event: KeyboardEvent) => {
		const key = event.key;
		if (["ArrowUp", "ArrowDown", "w", "s"].includes(key)) {
			keysPressed.delete(key);
		}
	});

	// ---- Sending player inputs to server
	function sendInputLoop() {
		if (keysPressed.size > 0 && socket && socket.readyState === WebSocket.OPEN && currentMatchId) {
			socket.send(
				JSON.stringify({
					type: "input",
					matchId: currentMatchId,
					playerId,
					payload: Array.from(keysPressed),
				})
			);
		}
		animationFrameId = requestAnimationFrame(sendInputLoop);
	}
	sendInputLoop();

	// ---- Receiving Server updated positions
	socket.addEventListener("message", (event: MessageEvent) => {
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
		} catch (err) {
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



// Example: Poll URL hash and start/stop with a generated matchId
setInterval(() => {
	const isOnPongGame = window.location.hash === "#pongSingle";
	if (!isOnPongGame && socketInitialized) {
		stopPongWebSocket();
	}
}, 100);
