let socket: WebSocket | null = null;
let socketInitialized = false;
let currentMatchId: string | null = null;
let currentIsLocal: boolean = true;

interface MatchCheckResponse {
	exists: boolean;
	playerCount: number;
}

async function startPongWebSocket( matchId: string, isLocal: boolean = false, aiGame: boolean = false, teamGame: boolean = false, localNicks: string[] = null) {
	
	if (socket) {
		console.log("Closing existing WebSocket connection...");
		socket.close();
		socket = null;
		socketInitialized = false;
	}

	if (socketInitialized) {
		console.log("game already in Progress");
		return;
	}
	socketInitialized = true;
	currentMatchId = matchId;
	currentIsLocal = isLocal;

	let animationFrameId: number;
	let playerId: "p1" | "p2" | "p3" | "p4" = "p1";
	const keysPressed = new Set<string>();

	// --- WebSocket Setup
	socket = new WebSocket(`ws://${window.location.hostname}:3000/game`);

	let nickname: string;
	let opponentNickname: string | null = null;
	if (localNicks && localNicks.length > 1) {
		nickname = localNicks[0];
		opponentNickname = localNicks[1];
	} else nickname = await getNickOnLocalStorage();

	socket.addEventListener("open", () => {
		console.log("✅ Connected to WebSocket server");
		socket.send(
			JSON.stringify({
				type: "join",
				matchId: matchId,
				isLocal: isLocal,
				aiGame: aiGame,
				nickname: nickname,
				opponentNickname: opponentNickname,
				teamGame: teamGame,
			})
		);
	});

	socket.addEventListener("close", () => {
		console.log("❌ WebSocket connection closed");
		cancelAnimationFrame(animationFrameId);
	});

	socket.addEventListener("error", (event: Event) => {
		console.error("WebSocket error:", event);
	});

	// --- Game Elements
	const paddleContest1 = document.querySelector(".paddle1Contest") as HTMLElement;
	const paddle1 = document.querySelector(".paddle1") as HTMLElement;
	const paddleContest2 = document.querySelector(".paddle2Contest") as HTMLElement;
	const paddle2 = document.querySelector(".paddle2") as HTMLElement;
	const paddleContest3 = document.querySelector(".paddle3Contest") as HTMLElement;
	const paddle3 = document.querySelector(".paddle3") as HTMLElement;
	const paddleContest4 = document.querySelector(".paddle4Contest") as HTMLElement;
	const paddle4 = document.querySelector(".paddle4") as HTMLElement;
	const ballContest = document.querySelector(".ballContest") as HTMLElement;
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

	if (!teamGame) {
		paddle3.classList.add("offPaddle");
		paddle4.classList.add("offPaddle");
	} else {
		paddle3.classList.remove("offPaddle");
		paddle4.classList.remove("offPaddle");
	}

	socket.addEventListener("message", async (event: MessageEvent) => {
		try {
			const data = JSON.parse(event.data);

			switch (data.type) {
				case "state": {
					const state = data.payload;
					window.dispatchEvent(new CustomEvent("gameStateUpdate", { detail: state }));

					if (paddle1) {
						paddle1.style.top = `${state.paddles.p1}%`;
						paddleContest1.style.top = `${state.paddles.p1}%`;
					}

					if (paddle2) {
						paddle2.style.top = `${state.paddles.p2}%`;
						paddleContest2.style.top = `${state.paddles.p2}%`;
					}

					if (paddle3 && teamGame) {
						paddle3.style.top = `${state.paddles.p3}%`;
						paddleContest3.style.top = `${state.paddles.p3}%`;
					}

					if (paddle4 && teamGame) {
						paddle4.style.top = `${state.paddles.p4}%`;
						paddleContest4.style.top = `${state.paddles.p4}%`;
					}

					if (ball) {
						ball.style.left = `${state.ball.x}%`;
						ball.style.top = `${state.ball.y}%`;
						ballContest.style.left = `${state.ball.x}%`;
						ballContest.style.top = `${state.ball.y}%`;
					}
					break;
				}
				case "assign": {
					playerId = data.payload;
					if (playerId === "p1" && !isLocal) setGameScore(await getNickOnLocalStorage(), "Player 2");
					break;
				}
				case "PlayerBoard": {
					const players = data.payload;
					if (!aiGame && !isLocal) setGameScore(players[0], players[1]);
					return;
				}
				case "startAnimation": {
					animateTimer();
					break;
				}
				case "gameOver": {
					var { winner, reason } = data.payload;
					if (winner === null) winner = "Bot";

					setTimeout(() => {


						if (currentMatchId) {
							window.dispatchEvent(
								new CustomEvent("ShowWinner", {
									detail: { matchId: currentMatchId, winner: winner, isLocal: isLocal, reason: reason },
								})
							);
						}
						setGameScore("Player 1", "Player 2");
						stopPongWebSocket();
					}, 250);
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
	//location.reload();
}

setInterval(() => {
	const hash = window.location.hash;
	const matchPrefix = "#pong/";
	const isOnPongGame = hash.startsWith(matchPrefix) && hash.slice(matchPrefix.length) === currentMatchId;

	if (!isOnPongGame && socketInitialized) {
		stopPongWebSocket();
		console.log("closed socket from FrontEnd (leaving page)");
		console.log(currentMatchId);
	}
}, 100);

function generateMatchId() {
	return Math.floor(1000 + Math.random() * 90000).toString();
}


window.addEventListener("ShowWinner", async (event: CustomEvent) => {
	const { matchId, winner, isLocal, reason } = event.detail;


	openVictory(`Game Over!\nThe winner is ${winner}!`);

	await waitForEvent("next");

	if (matchId) {
		window.dispatchEvent(
			new CustomEvent("MatchEnd", {
				detail: { matchId: matchId, winner: winner, isLocal: isLocal },
			})
		);
	}


});

async function waitForEvent(eventName: string): Promise<CustomEvent> {
	return new Promise((resolve) => {
		const handler = (event: CustomEvent) => {
			window.removeEventListener(eventName, handler); // Remove the listener after it's triggered
			resolve(event); // Resolve the promise with the event
		};
		window.addEventListener(eventName, handler);
	});
}
