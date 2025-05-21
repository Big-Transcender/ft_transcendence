function startGameLoop(wss, { getGameState, updateBall }) {
	setInterval(() => {
		const gameState = getGameState();
		if (gameState.onGoing) updateBall();

		const message = JSON.stringify({ type: 'state', payload: gameState });
		wss.clients.forEach(client => {
			if (client.readyState === 1) client.send(message);
		});
	}, 10); // 60 FPS
}

module.exports = startGameLoop;
