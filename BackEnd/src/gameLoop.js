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

	let waitingForPlayers = true;
	setTimeout(async () => {
		if (clients.size < requiredPlayers) {
			console.log(`⏳ Not enough players connected for match ${matchId}. Declaring winner by default.`);
			if (clients.size === 1) {
				// Declare the remaining player as the winner
				player = await getNicknameByUserId(match.gameState.playerDbId.p1)
				match.gameState.winnerName = player;
				console.log(`🏆 Player (${player}) wins match ${matchId} by default!`);
				cleanupMatch(matchId, "opponentDidNotConnect");
			} else {
				// No players connected, clean up the match
				console.log(`🗑️ No players connected for match ${matchId}. Cleaning up.`);
				cleanupMatch(matchId, "noPlayersConnected");
			}
		}
		waitingForPlayers = false;
	}, 15000); 

	match.intervalId = setInterval(async () => {
		
		if (clients.size === requiredPlayers) { //requiredPlayers

			if (!gameState.onGoing && !gameState.started) {
				gameState.started = true;
				player1 = await getNicknameByUserId(match.gameState.playerDbId.p1) || "Player 1"
				player2 = await getNicknameByUserId(match.gameState.playerDbId.p2) || "Player 2"

				match.clients.forEach((client) => {
					const message = JSON.stringify({ 
						type: 'PlayerBoard', 
						payload: [player1, player2]
					});
					if (client.ws.readyState === 1) {
						client.ws.send(message);
					}
				});
				if (requiredPlayers > 1){
					match.clients.forEach((client) => {
						const message = JSON.stringify({ 
							type: 'startAnimation', 
						});
						if (client.ws.readyState === 1) {
							client.ws.send(message);
						}
					});
				}
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

async function cleanupMatch(matchId, reason = "unknown", nick = null)
{
	const match = matches.get(matchId);
	if (!match) return;

	// Notify all clients about the match cleanup
	match.clients.forEach(async (client) => {
		const message = JSON.stringify({
			type: 'gameOver',
			payload: { winner: await getNicknameByUserId(match.gameState.winnerId) || await getNicknameByUserId(nick) || match.gameState.winnerName, reason },
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