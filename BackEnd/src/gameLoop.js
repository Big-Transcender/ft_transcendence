const { getNicknameByUserId } = require('./dataQuerys');

const matches = new Map(); // matchId -> { gameState, clients, intervalId }

function createMatch(matchId, createInitialGameState) {
	const gameState = createInitialGameState();
	const clients = new Map();
	const match = { gameState, clients, intervalId: null };
	matches.set(matchId, match);
	return match;
}

function startGameLoopForMatch(matchId, updateBall, isLocal = false, aiGame = false, teamGame = false) {
	const match = matches.get(matchId);
	if (!match || match.intervalId)
		return;

	const { gameState, clients } = match;
	gameState.GamePlayLocal = isLocal;
	gameState.aiGame = aiGame;
	var requiredPlayers = isLocal ? 1 : 2;
	if (teamGame)
		requiredPlayers = 4

	match.intervalId = setInterval(() => {

		//TODO removed what is in line 17 -> 22, needs testing
		
		if (clients.size === requiredPlayers) { //requiredPlayers


			if (!gameState.onGoing && !gameState.started) {
				gameState.started = true;
				console.log("⏳ Starting game in 3 seconds...");
				startTimer(3000, gameState);
			}

			// Only update ball if game is active
			if (gameState.onGoing) {
				updateBall(gameState);
				if (gameState.finished) {
					console.log("🏁 Game over! Cleaning up match...");
					cleanupMatch(matchId, "gameFinished");
					return;
				}
			}

			const message = JSON.stringify({ type: 'state', payload: gameState });

			// Send game state to clients
			clients.forEach(client => {
				if (client.ws.readyState === 1) {
					client.ws.send(message);
				}
			});
		}

	}, 10); // 60 FPS
}

function removeClientFromMatch(matchId, ws) {
	const match = matches.get(matchId);
	if (!match)
		return;
	match.clients.delete(ws);
	if (match.clients.size === 0) {
		cleanupMatch(matchId, "noPlayersLeft");
	}
}

function startTimer(time, gameState) {
	gameState.onGoing = false;
	setTimeout(() => {
		gameState.onGoing = true;
		console.log("✅ Game started!");
	}, time);
}

function cleanupMatch(matchId, reason = "unknown", nick = null)
{
	const match = matches.get(matchId);
	if (!match) return;

	// Notify all clients about the match cleanup
	match.clients.forEach((client) => {
		const message = JSON.stringify({
			type: 'gameOver',
			payload: { winner: getNicknameByUserId(match.gameState.winnerId) || getNicknameByUserId(nick), reason },
		});
		if (client.ws.readyState === 1) {
			client.ws.send(message);
			client.ws.close();
		}
	});

	clearInterval(match.intervalId);
	matches.delete(matchId);

	console.log(`🗑️ Match ${matchId} removed (reason: ${reason})`);
}

module.exports = {
	matches,
	createMatch,
	startGameLoopForMatch,
	removeClientFromMatch,
	cleanupMatch
};