const { handleInput } = require('./gameLogic');

let aiTick = 0;

function aiMove(gameState) {
	if (!gameState.onGoing)
		return;

	const paddleY = gameState.paddles.p2;
	const ballY = gameState.ball.y;
	const ballVel = gameState.ballVel.x;

	aiTick++;
	if (aiTick % 4 !== 0)
		return;

	const tolerance = 5; // Only move if ball is more than 2 units away

	let keys = [];
	if (ballVel > 0)
	{
		if (ballY < paddleY - tolerance)
			keys.push('ArrowUp');
		else if (ballY > paddleY + tolerance)
			keys.push('ArrowDown');
	}
	
	handleInput(gameState, 'p2', keys);
}

module.exports = { aiMove };

