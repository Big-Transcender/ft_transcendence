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

				if (!match.gameState.finished && match.clients.size === 1) {
					const remainingPlayer = Array.from(match.clients.keys())[0];
					const winnerNickname = match.clients.get(remainingPlayer)?.nickname;
		
					console.log(`🏆 Player ${remainingPlayer} (${winnerNickname}) wins match ${matchId} by default!`);
		
					const gameState = match.gameState;
					const winnerId = gameState.playerDbId[remainingPlayer];
					console.log(gameState.playerDbId.p1);
					console.log(gameState.playerDbId.p2);
					console.log(winnerId);
					insertMatch( gameState.playerDbId.p1, gameState.playerDbId.p2, winnerId, gameState.score[remainingPlayer] , gameState.score[assignedPlayer] );
					cleanupMatch(matchId, "opponentLeft", winnerId);
				}
				else if (match.clients.size === 0)
					cleanupMatch(matchId, "noPlayersLeft");
				else if (!match.gameState.finished && match.clients.size === 3)
					seeTeamMatchDisconection(match);
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

function seeTeamMatchDisconection(match){
	const team1Players = ['p1', 'p3']; // Players in Team 1
	const team2Players = ['p2', 'p4']; // Players in Team 2

	// Check which players are still connected
	const team1Remaining = team1Players.filter(player => match.clients.has(player));
	const team2Remaining = team2Players.filter(player => match.clients.has(player));

	if (team1Remaining.length === 0) {
		// Team 2 wins by default
		console.log("🏆 Team 2 wins by default due to Team 1 disconnection!");

		const gameState = match.gameState;
		const winnerId = gameState.playerDbId.p2; // Any player from Team 2

		// Log the match results for both teams
		insertMatch( gameState.playerDbId.p1, gameState.playerDbId.p2, winnerId, gameState.score.p1, gameState.score.p2);
		insertMatch(gameState.playerDbId.p3, gameState.playerDbId.p4, gameState.playerDbId.p4, gameState.score.p1, gameState.score.p2);

		// Notify remaining players in Team 2
		const message = JSON.stringify({
			type: 'gameOver',
			payload: { winner: "Team 2", reason: "Team 1 disconnected" },
		});
		team2Remaining.forEach(playerKey => {
			const client = match.clients.get(playerKey);
			if (client?.ws.readyState === 1) {
				client.ws.send(message);
			}
		});

		// Clean up the match
		cleanupMatch(match.matchId, "team1Disconnected", winnerId);
	} else if (team2Remaining.length === 0) {
		// Team 1 wins by default
		console.log("🏆 Team 1 wins by default due to Team 2 disconnection!");

		const gameState = match.gameState;
		const winnerId = gameState.playerDbId.p1; // Any player from Team 1

		// Log the match results for both teams
		insertMatch( gameState.playerDbId.p1, gameState.playerDbId.p2, winnerId, gameState.score.p1, gameState.score.p2);
		insertMatch( gameState.playerDbId.p3, gameState.playerDbId.p4, gameState.playerDbId.p3, gameState.score.p1, gameState.score.p2);

		// Notify remaining players in Team 1
		const message = JSON.stringify({
			type: 'gameOver',
			payload: { winner: "Team 1", reason: "Team 2 disconnected" },
		});
		team1Remaining.forEach(playerKey => {
			const client = match.clients.get(playerKey);
			if (client?.ws.readyState === 1) {
				client.ws.send(message);
			}
		});

		// Clean up the match
		cleanupMatch(match.matchId, "team2Disconnected", winnerId);
	}
}




module.exports = setupWebSocket;


