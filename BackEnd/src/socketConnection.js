const WebSocket = require('ws');
const { matches, createMatch, startGameLoopForMatch, removeClientFromMatch } = require('./gameLoop');
const { createInitialGameState, updateBall, handleInput } = require('./gameLogic'); // adjust as needed

function setupWebSocket(server) {
	const wss = new WebSocket.Server({ server });

	wss.on('connection', (ws) => {
		let matchId = null;

		ws.on('message', (message) => {
			let parsed;
			try {
				parsed = JSON.parse(message.toString());
			} catch {
				console.warn('❌ Invalid JSON:', message.toString());
				return;
			}

			// Client must send a join message with matchId
			if (parsed.type === 'join') {
				matchId = parsed.matchId;
				const isLocal = parsed.isLocal || false;

				// Create match if it doesn't exist
				if (!matches.has(matchId)) {
					createMatch(matchId, createInitialGameState);
					startGameLoopForMatch(matchId, updateBall, isLocal);
				}

				// Add client to match
				matches.get(matchId).clients.add(ws);
			}

			// Handle input for the correct match
			if (parsed.type === 'input' && matchId && matches.has(matchId)) {
				const match = matches.get(matchId);
				handleInput(match.gameState, parsed.playerId, parsed.payload); // Pass playerId and keys array
			}
		});

		ws.on('close', () => {
			if (matchId) {
				removeClientFromMatch(matchId, ws);
			}
		});
	});

	return wss;
}

module.exports = setupWebSocket;
