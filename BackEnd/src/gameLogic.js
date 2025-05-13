


var GamePlayLocal = false;


const gameState = {
	paddles: { p1: 40, p2: 40 }, // Position in %
	ball: { x: 50, y: 50 },      // Position in %
	ballVel: { x: 0.5, y: 0.5 }  // Velocity in % per frame
};

function movePaddle(player, direction) {
	const step = 5; // Move by 5%
	if (direction === 'up') gameState.paddles[player] = Math.max(0, gameState.paddles[player] - step);
	if (direction === 'down') gameState.paddles[player] = Math.min(85, gameState.paddles[player] + step);
}

function updateBall() {
	gameState.ball.x += gameState.ballVel.x;
	gameState.ball.y += gameState.ballVel.y;

	const paddleHeight = (75 / 500) * 100;      // 10%
	const paddleWidth = (20 / 900) * 100;       // ~1.1%
	const ballSizeX = (30 / 900) * 100;         // ~3.3%
	const ballSizeY = (30 / 500) * 100;         // ~6%

	// Wall collision
	if (gameState.ball.y <= 0 || gameState.ball.y + ballSizeY >= 100) {
		gameState.ballVel.y *= -1;
	}

	// Scoring: reset
	if (gameState.ball.x + ballSizeX <= 0 || gameState.ball.x >= 100) {
		gameState.ball = { x: 50, y: 50 };
		gameState.ballVel.x *= -1;
		return;
	}

	// Calculate center Y of ball
	const ballCenterY = gameState.ball.y + ballSizeY / 2;

	// 🏓 Left Paddle Collision (Player 1)
	if (
		gameState.ball.x <= paddleWidth &&
		ballCenterY >= gameState.paddles.p1 &&
		ballCenterY <= gameState.paddles.p1 + paddleHeight
	) {
		const paddleCenterY = gameState.paddles.p1 + paddleHeight / 2;
		const impact = (ballCenterY - paddleCenterY) / (paddleHeight / 2);

		const speed = Math.hypot(gameState.ballVel.x, gameState.ballVel.y);
		var angle = impact; // Between -1 and 1
		if (angle > 0.45)
			angle = 0.45;
		else if (angle < -0.45)
			angle = -0.45;

		gameState.ballVel.x = Math.sqrt(1 - angle ** 2) * speed;
		gameState.ballVel.y = angle * speed;

		gameState.ball.x = paddleWidth + 0.1;
	}

	// 🏓 Right Paddle Collision (Player 2)
	if (
		gameState.ball.x + ballSizeX >= 100 - paddleWidth &&
		ballCenterY >= gameState.paddles.p2 &&
		ballCenterY <= gameState.paddles.p2 + paddleHeight
	) {
		const paddleCenterY = gameState.paddles.p2 + paddleHeight / 2;
		const impact = (ballCenterY - paddleCenterY) / (paddleHeight / 2);

		const speed = Math.hypot(gameState.ballVel.x, gameState.ballVel.y);
		var angle = impact; // Between -1 and 1
		if (angle > 0.45)
			angle = 0.45;
		else if (angle < -0.45)
			angle = -0.45;

		gameState.ballVel.x = -Math.sqrt(1 - angle ** 2) * speed;
		gameState.ballVel.y = angle * speed;

		gameState.ball.x = 100 - paddleWidth - ballSizeX - 0.1;
	}
}


function getGameState() {
	return gameState;
}

module.exports = {
	movePaddle,
	updateBall,
	getGameState
};
