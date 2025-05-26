
let gameLoopStarted = false;

function startGameLoop(wss, { getGameState, updateBall }) {
	if (gameLoopStarted)
		return; // avoid double start
	gameLoopStarted = true;

	setInterval(() => {
		const gameState = getGameState();
		gameState.GamePlayLocal = false;

		if (wss.clients.size === 2) {
			// Start timer only once when game is not ongoing
			if (!gameState.onGoing && !gameState.started) {
				gameState.started = true;
				console.log("⏳ Starting game in 3 seconds...");
				startTimer(3000, gameState);
			}

			// Only update ball if game is active
			if (gameState.onGoing) {
				updateBall();
			}

			const message = JSON.stringify({ type: 'state', payload: gameState });

			// Send game state to client
			wss.clients.forEach(client => {
				if (client.readyState === 1) {
					client.send(message);
				}
			});
		}
	}, 10); // 60 FPS
}


function startGameLoopLocal(wss, { getGameState, updateBall }) {
	if (gameLoopStarted)
		return; // avoid double start
	gameLoopStarted = true;

	setInterval(() => {
		const gameState = getGameState();
		gameState.GamePlayLocal = true;

		if (wss.clients.size === 1) {
			// Start timer only once when game is not ongoing
			if (!gameState.onGoing && !gameState.started) {
				gameState.started = true;
				console.log("⏳ Starting game in 3 seconds...");
				startTimer(3000, gameState);
			}

			// Only update ball if game is active
			if (gameState.onGoing) {
				updateBall();
			}

			const message = JSON.stringify({ type: 'state', payload: gameState });

			// Send game state to client
			wss.clients.forEach(client => {
				if (client.readyState === 1) {
					client.send(message);
				}
			});
		}
	}, 10); // 60 FPS
}




function startTimer(time, gameState) {
	gameState.onGoing = false;

	setTimeout(() => {
		gameState.onGoing = true;
		console.log("✅ Game started!");
	}, time);
}


module.exports = {startGameLoop, startGameLoopLocal};


/*function startGameLoop(wss, { getGameState, updateBall })
{
	setInterval(() => {
		const gameState = getGameState();
		gameState.GamePlayLocal = false;
		const message = JSON.stringify({ type: 'state', payload: gameState });

		if (wss.clients.size === 2)
		{
			if (gameState.onGoing)
				updateBall();
			
			wss.clients.forEach(client => {
				if (client.readyState === 1)
					client.send(message);
			});
		}
		
	}, 10); // 60 FPS
}*/