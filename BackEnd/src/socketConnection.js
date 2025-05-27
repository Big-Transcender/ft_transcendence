const WebSocket = require('ws');

function setupWebSocket(server, { handleInput, getGameState, resetGame }) {
	const wss = new WebSocket.Server({ server });
	const players = new Map();
	let availablePlayers = ['p1', 'p2'];

	wss.on('connection', (ws) =>
	{
		let assignedPlayer = null;
		if (availablePlayers.length > 0)
		{
			assignedPlayer = availablePlayers.shift();
			players.set(ws, assignedPlayer);
			console.log(`🟢 Connected: ${assignedPlayer}`);
			ws.send(JSON.stringify({ type: 'assign', payload: assignedPlayer }));
		}
		else
			console.log('⚠️ Extra connection rejected');


		ws.send(JSON.stringify({ type: 'state', payload: getGameState() }));

		ws.on('message', (message) =>
		{
			let parsed;
			try {
				parsed = JSON.parse(message.toString());
			} catch {
				console.warn('❌ Invalid JSON:', message.toString());
				return;
			}

			if (parsed.type === 'input') {
				const keys = Array.isArray(parsed.payload) ? parsed.payload : [parsed.payload];
				const playerId = players.get(ws);
				if (playerId)
					handleInput(playerId, keys);
			}
		});

		ws.on('close', () =>
		{
			const playerId = players.get(ws);
			console.log(`🔴 Disconnected: ${playerId}`);
			players.delete(ws);
			if (playerId && !availablePlayers.includes(playerId)) {
				availablePlayers.push(playerId);
				availablePlayers.sort();
			}

			if (players.size < 2) {
				resetGame();
				console.log('🔄 Game state reset due to player disconnect');
			}
		});
	});

	return wss;
}

module.exports = setupWebSocket;
