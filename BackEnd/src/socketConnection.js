const WebSocket = require('ws');
const { matches, createMatch, startGameLoopForMatch, cleanupMatch } = require('./gameLoop');
const { createInitialGameState, updateBall, updateBall4Players, handleInput } = require('./gameLogic');
const { insertMatch, getUserIdByNickname } = require('./dataQuerys.js');

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

				if (!match.gameState.finished && (match.clients.size === 1 || match.clients.size === 3)) {
					const remainingPlayer = Array.from(match.clients.keys())[0];
					const winnerNickname = match.clients.get(remainingPlayer)?.nickname;
		
					console.log(`🏆 Player ${remainingPlayer} (${winnerNickname}) wins match ${matchId} by default!`);
		
					const gameState = match.gameState;
					const winnerId = gameState.playerDbId[remainingPlayer];
					const loserId = gameState.playerDbId[assignedPlayer];
					insertMatch( winnerId, loserId, winnerId, gameState.score[remainingPlayer] , gameState.score[assignedPlayer] );
					cleanupMatch(matchId, "opponentLeft", winnerId);
				} else if (!match.gameState.finished && match.clients.size === 0) {
					cleanupMatch(matchId, "noPlayersLeft");
				}
			}
		});
	});

	return wss;
}

function setPlayers(match, nickname, ws, matchId, team)
{
	const maxPlayers = team ? 4 : 2;
	let assignedPlayer = null;

	for (let i = 1; i <= maxPlayers; i++) {
		const playerKey = `p${i}`;
		if (!match.clients.has(playerKey)) {
			match.clients.set(playerKey, { nickname, ws });
			match.gameState.playerDbId[playerKey] = getUserIdByNickname(nickname);
			assignedPlayer = playerKey;
			break;
		}
	}

	if (!assignedPlayer) {
		ws.send(JSON.stringify({ type: 'error', message: 'Match is full' }));
		ws.close();
		return null;
	}

	ws.send(JSON.stringify({ type: 'assign', payload: assignedPlayer }));
	console.log(`🎮 Player ${assignedPlayer} joined match ${matchId}`);
	return assignedPlayer;
}





module.exports = setupWebSocket;
