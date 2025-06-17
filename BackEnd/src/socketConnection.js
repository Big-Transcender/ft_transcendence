const WebSocket = require('ws');
const { matches, createMatch, startGameLoopForMatch, removeClientFromMatch } = require('./gameLoop');
const { createInitialGameState, updateBall, updateBall4Players, handleInput } = require('./gameLogic');

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
				const aiGame = parsed.aiGame || false;
				const nickname = parsed.nickname || null;
				const team = parsed.teamGame || false;

				if (!matches.has(matchId)) {
					createMatch(matchId, createInitialGameState);
					if (!team)
						startGameLoopForMatch(matchId, updateBall, isLocal, aiGame);
					else
						startGameLoopForMatch(matchId, updateBall4Players, isLocal, aiGame, team);
				}

				const match = matches.get(matchId);
				assignedPlayer = setPlayers(match, nickname, ws, matchId, team);
			}
			else if (parsed.type === 'input' && matchId && matches.has(matchId)) {
				const match = matches.get(matchId);
				handleInput(match.gameState, parsed.playerId, parsed.payload);
			}
		});

		ws.on('close', () => {
			if (matchId && matches.has(matchId)) {
				const match = matches.get(matchId);
				if (assignedPlayer && match.clients.get(assignedPlayer)?.ws === ws) {
					match.clients.delete(assignedPlayer);
					console.log(`👋 Player ${assignedPlayer} left match ${matchId}`);
				}

				if (match.clients.size === 0) {
					clearInterval(match.intervalId)
					matches.delete(matchId);
					console.log(`🗑️ Match ${matchId} removed (no players left)`);
				}
			}
		});
	});

	return wss;
}

function setPlayers(match, nickname, ws, matchId, team) {

	if (!match.clients.has('p1')) {
		match.clients.set('p1', {nickname, ws});
		match.gameState.playerDbId.p1 = nickname;
		assignedPlayer = 'p1';
	} else if (!match.clients.has('p2')) {
		match.clients.set('p2', {nickname, ws});
		match.gameState.playerDbId.p2 = nickname;
		assignedPlayer = 'p2';
	} else {
		if (!team)
		{
			ws.send(JSON.stringify({ type: 'error', message: 'Match is full' }));
			ws.close();
			return;
		}
		else if (!match.clients.has('p3')) {
			match.clients.set('p3', {nickname, ws});
			match.gameState.playerDbId.p3 = nickname;
			assignedPlayer = 'p3';
		}
		else if (!match.clients.has('p4')) {
			match.clients.set('p4', {nickname, ws});
			match.gameState.playerDbId.p4 = nickname;
			assignedPlayer = 'p4';
		}
	}
	ws.send(JSON.stringify({ type: 'assign', payload: assignedPlayer }));
	console.log(`🎮 Player ${assignedPlayer} joined match ${matchId}`);
	return assignedPlayer;

}

module.exports = setupWebSocket;
