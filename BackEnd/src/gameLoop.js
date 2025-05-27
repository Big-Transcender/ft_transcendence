



function startGameLoop(wss, { getGameState, updateBall })
{
	setInterval(() => {
		const gameState = getGameState();
		gameState.GamePlayLocal = false;
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

function startGameLoopLocal(wss, { getGameState, updateBall })
{
	setInterval(() => {
		const gameState = getGameState();
		gameState.GamePlayLocal = true;
		const message = JSON.stringify({ type: 'state', payload: gameState });

		if (wss.clients.size === 1)
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


module.exports = {startGameLoop, startGameLoopLocal};
