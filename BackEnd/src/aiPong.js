
let aiTick = 0;

function aiMove(gameState, handleInput) {
	if (!gameState.onGoing)
		return;

	const paddleY = gameState.paddles.p2;
	const ballY = gameState.ball.y;
	const ballVel = gameState.ballVel.x;

	aiTick++;
	if (aiTick % 4 !== 0)
		return;

	const tolerance = 5;

	let keys = [];
	if (ballVel > 0)
	{
		if (ballY < paddleY - tolerance)
			keys.push('ArrowUp');
		else if (ballY > paddleY + tolerance)
			keys.push('ArrowDown');
	}
	
	handleInput(gameState, 'p2', keys, true);
	//console.log(`AI moved paddle p2 with keys: ${keys.join(', ')}`);
}

module.exports = { aiMove };

