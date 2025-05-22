const { insertMatch } = require('./dataQuerys');


var PaddleSpeed = 3
const HitBoxBuffer = 3
const paddleHeight = (75 / 500) * 100 + HitBoxBuffer;
const paddleWidth = (20 / 900) * 100;


var speed = 0.7;
const ballSizeX = (33 / 900) * 100;
const ballSizeY = (33 / 500) * 100;

var numbrBalls = 10;


var GamePlayLocal = false;

const gameState = {
	paddles: { p1: 40, p2: 40 }, // Position in %
	ball: { x: 50, y: 50 },      // Position in %
	ballVel: { x: 0.5, y: 0.5 }, // Velocity in % per frame
	score: { p1: 0, p2: 0},
	playerId: { p1: 1, p2: 2},
	onGoing: true
};

function resetBall(ball, ballVel)
{

	ball.x = 50;
	ball.y = 50;

	// Random angle between -45° and 45°
	const angle = Math.random() * Math.PI / 2 - Math.PI / 4;
	const direction = Math.random() < 0.5 ? 1 : -1;
	const speed = 0.5;

	ballVel.x = direction * speed * Math.cos(angle);
	ballVel.y = speed * Math.sin(angle);
}


function handleInput(playerId, keys)
{
	if (GamePlayLocal)
		keys.forEach((key) => handleInputLocal(key));
	else
	{
		keys.forEach((key) => {
			if (key === 'ArrowUp' || key === 'w')
				movePaddle(playerId, 'up');
			else if (key === 'ArrowDown' || key === 's')
				movePaddle(playerId, 'down');
		});
	}
}


function handleInputLocal(key)
{
	if (key === 'ArrowUp')
		movePaddle('p2', 'up');
	else if (key === 'ArrowDown')
		movePaddle('p2', 'down');
	else if (key === 'w')
		movePaddle('p1', 'up');
	else if (key === 's')
		movePaddle('p1', 'down');
}


function movePaddle(player, direction)
{
	const step = PaddleSpeed;
	if (direction === 'up')
		gameState.paddles[player] = Math.max(0, gameState.paddles[player] - step);
	if (direction === 'down')
		gameState.paddles[player] = Math.min(85, gameState.paddles[player] + step);
}

function getImpactAngle(impact)
{
	var angle;
	
	if (impact > 0.45)
		angle = 0.45;
	else if (impact < -0.45)
		angle = -0.45;
	else
		angle = impact;

	speed += 0.1
	return angle;
}



function updateBall(){

	gameState.ball.x += gameState.ballVel.x;
	gameState.ball.y += gameState.ballVel.y;
	
	// Wall collision
	if (gameState.ball.y <= 0 || gameState.ball.y + ballSizeY >= 100) {
		gameState.ballVel.y *= -1;
		//speed += 0.1;
	}

	// Scoring: reset
	if (gameState.ball.x + ballSizeX <= 0 || gameState.ball.x >= 100)
	{
		if (gameState.ball.x + ballSizeX <= 0)
			gameState.score.p2 += 1;
		else
			gameState.score.p1 += 1;
		numbrBalls -= 1;
		console.log(numbrBalls)
		return resetBall(gameState.ball, gameState.ballVel), speed = 0.7
	}

	if (numbrBalls == 0 && gameState.onGoing)
	{
		var winnerId = gameState.playerId.p1;
		if (gameState.score.p1 < gameState.score.p2)
			winnerId = gameState.playerId.p2;
		insertMatch(gameState.playerId.p1, gameState.playerId.p2, winnerId, gameState.score.p1, gameState.score.p2);
		gameState.onGoing = false
	}

	// Calculate center Y of ball
	const ballCenterY = gameState.ball.y + ballSizeY / 2;

	// (Player 1) left
	if (
		gameState.ball.x <= paddleWidth &&
		ballCenterY >= gameState.paddles.p1 - HitBoxBuffer &&
		ballCenterY <= gameState.paddles.p1 + paddleHeight
	) {
		const paddleCenterY = gameState.paddles.p1 + paddleHeight / 2;
		const impact = (ballCenterY - paddleCenterY) / (paddleHeight / 2);
		var angle = getImpactAngle(impact)

		gameState.ballVel.x = Math.sqrt(1 - angle ** 2) * speed;
		gameState.ballVel.y = angle * speed;

		//gameState.ball.x = paddleWidth + 0.1;
	}

	// (Player 2) right
	if (
		gameState.ball.x + ballSizeX >= 100 - paddleWidth &&
		ballCenterY >= gameState.paddles.p2 - HitBoxBuffer &&
		ballCenterY <= gameState.paddles.p2 + paddleHeight
	) {
		const paddleCenterY = gameState.paddles.p2 + paddleHeight / 2;
		const impact = (ballCenterY - paddleCenterY) / (paddleHeight / 2);
		var angle = getImpactAngle(impact)

		gameState.ballVel.x = -Math.sqrt(1 - angle ** 2) * speed;
		gameState.ballVel.y = angle * speed;

		//gameState.ball.x = 101 - paddleWidth - ballSizeX - 0.1;
	}
}


function getGameState() {
	return gameState;
}

module.exports = {
	updateBall,
	handleInput,
	getGameState
};
