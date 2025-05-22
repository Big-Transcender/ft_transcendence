



function startGameLoop(wss, { getGameState, updateBall })
{
	setInterval(() => {
		const gameState = getGameState();
		
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
}


module.exports = startGameLoop;
