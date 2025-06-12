const WebSocket = require('ws');
const { matches, createMatch, startGameLoopForMatch, removeClientFromMatch } = require('./gameLoop');
const { createInitialGameState, updateBall, handleInput } = require('./gameLogic');

function setupWebSocket(server) {
	const wss = new WebSocket.Server({ server });

	wss.on('connection', (ws) => {
		let matchId = null;
		let assignedPlayer = null;

		ws.on('message', (message) => {
			let parsed;
			try {
				parsed = JSON.parse(message.toString());
			} catch {
				console.warn('❌ Invalid JSON:', message.toString());
				return;
			}

			if (parsed.type === 'join') {
				matchId = parsed.matchId;
				const isLocal = parsed.isLocal || false;

				if (!matches.has(matchId)) {
					createMatch(matchId, createInitialGameState);
					startGameLoopForMatch(matchId, updateBall, isLocal);
				}

				const match = matches.get(matchId);
				if (!match.clients.has('p1')) {
					match.clients.set('p1', ws);
					assignedPlayer = 'p1';
				} else if (!match.clients.has('p2')) {
					match.clients.set('p2', ws);
					assignedPlayer = 'p2';
				} else {
					ws.send(JSON.stringify({ type: 'error', message: 'Match is full' }));
					ws.close();
					return;
				}
				ws.send(JSON.stringify({ type: 'assign', payload: assignedPlayer }));
				console.log(`🎮 Player ${assignedPlayer} joined match ${matchId}`);
			}
			else if (parsed.type === 'input' && matchId && matches.has(matchId)) {
				const match = matches.get(matchId);
				handleInput(match.gameState, parsed.playerId, parsed.payload);
			}
		});

		ws.on('close', () => {
			if (matchId && matches.has(matchId)) {
				const match = matches.get(matchId);
				if (assignedPlayer && match.clients.get(assignedPlayer) === ws) {
					match.clients.delete(assignedPlayer);
					console.log(`👋 Player ${assignedPlayer} left match ${matchId}`);
				}

				if (match.clients.size === 0) {
					matches.delete(matchId);
					console.log(`🗑️ Match ${matchId} removed (no players left)`);
				}
			}
		});
	});

	return wss;
}

module.exports = setupWebSocket;
