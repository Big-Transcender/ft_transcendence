const { insertMatch } = require('./dataQuerys');
const { aiMove } = require('./aiPong');

const PaddleSpeed = 2;
const HitBoxBuffer = 3;
const paddleHeight = (75 / 500) * 100 + HitBoxBuffer;
const paddleWidth = (20 / 900) * 100;


const paddle3X = (80 / 900) * 100; // 80px offset from left, in percent
const paddle4X = 100 - ((80 / 900) * 100) - paddleWidth;

var SPEED = 0.7;
const ballSizeX = (33 / 900) * 100;
const ballSizeY = (33 / 500) * 100;

const BALLS = 9;

function createInitialGameState() {

	return {
		paddles: { p1: 45, p2: 45 , p3: 50, p4: 50 },
		ball: { x: 50, y: 50 },
		ballVel: { x: 0.5, y: 0 },
		score: { p1: 0, p2: 0 },
		playerId: { p1: 1, p2: 2, p3: 3, p4: 4 },
		playerDbId: { p1: 0, p2: 0, p3: 0, p4: 0},
		playersName: {player1: null, player2: null},
		winnerName: null,
		onGoing: false,
		started: false,
		finished: false,
		winnerId: -1,
		GamePlayLocal: true,
		numbrBalls: BALLS,
		speed: SPEED,
		aiGame: false,
	};

}

function resetBall(gameState) {
	gameState.ball.x = 50;
	gameState.ball.y = 50;

	const direction = Math.random() < 0.5 ? 1 : -1;
	gameState.speed = SPEED;

	gameState.ballVel.x = 0;
	gameState.ballVel.y = 0;

	setTimeout(() => {
		gameState.ballVel.x = direction * gameState.speed;
	}, 750);
}

function handleInput(gameState, playerId, keys, isAI = false) {

	if (!Array.isArray(keys))
		return;
	if (gameState.GamePlayLocal)
		keys.forEach((key) => handleInputLocal(playerId, gameState, key, isAI));
	else
		keys.forEach((key) => {
			if (key === 'ArrowUp' || key === 'w')
				movePaddle(gameState, playerId, 'up');
			else if (key === 'ArrowDown' || key === 's')
				movePaddle(gameState, playerId, 'down');
		});
}

function handleInputLocal(playerId, gameState, key, isAI) {

	if (gameState.aiGame){
		if (playerId === 'p1' && (key === 'w' || key === 'ArrowUp'))
			movePaddle(gameState, 'p1', 'up');
		else if (playerId === 'p1' && (key === 'ArrowDown' || key === 's'))
			movePaddle(gameState, 'p1', 'down');
	}
	else
	{
		if (key === 'w')
			movePaddle(gameState, 'p1', 'up');
		else if (key === 's')
			movePaddle(gameState, 'p1', 'down');
	}

	if (isAI || !gameState.aiGame) {
		if (key === 'ArrowUp')
			movePaddle(gameState, 'p2', 'up');
		else if (key === 'ArrowDown')
			movePaddle(gameState, 'p2', 'down');
	}

}

function movePaddle(gameState, player, direction) {
	const step = PaddleSpeed;
	if (direction === 'up')
		gameState.paddles[player] = Math.max(0, gameState.paddles[player] - step);
	if (direction === 'down')
		gameState.paddles[player] = Math.min(85, gameState.paddles[player] + step);
}

function getImpactAngle(gameState, impact) {
	let angle;
	if (impact > 0.45)
		angle = 0.45;
	else if (impact < -0.45)
		angle = -0.45;
	else
		angle = impact;
	gameState.speed += 0.05;
	let extra = 0.2;
	if (angle < 0)
		extra = -0.2;
	return angle + extra;
}

function updateBall(gameState) {
	gameState.ball.x += gameState.ballVel.x;
	gameState.ball.y += gameState.ballVel.y;

	// Calculate center Y of ball
	const ballCenterY = gameState.ball.y + ballSizeY / 2;

	// Wall collision
	let wallCollision = false;
	if (gameState.ball.y <= 0 || gameState.ball.y + ballSizeY >= 100) {
		gameState.ballVel.y *= -1;
		wallCollision = true;
	}

	// Scoring: reset
	if (gameState.ball.x + ballSizeX <= 0 || gameState.ball.x >= 100) {
		if (gameState.ball.x + ballSizeX <= 0)
			gameState.score.p2 += 1;
		else
			gameState.score.p1 += 1;
		gameState.numbrBalls -= 1;
		resetBall(gameState);
		return;
	}
	// Winning
	if ((gameState.score.p2 === 5 || gameState.score.p1 === 5) && gameState.onGoing ) {
		gameState.winnerId = gameState.playerDbId.p1;
		gameState.winnerName = gameState.playersName.player1
		if (gameState.score.p1 < gameState.score.p2)
		{
			gameState.winnerId = gameState.playerDbId.p2;
			gameState.winnerName = gameState.playersName.player2
		}
			
		insertOnDb(gameState);
		gameState.onGoing = false;
		gameState.finished= true;
	}



	// (Player 1) left
	if (
		gameState.ball.x <= paddleWidth &&
		ballCenterY >= gameState.paddles.p1 - HitBoxBuffer &&
		ballCenterY <= gameState.paddles.p1 + paddleHeight
	) {
		const paddleCenterY = gameState.paddles.p1 + paddleHeight / 2;
		const impact = (ballCenterY - paddleCenterY) / (paddleHeight / 2);
		const angle = getImpactAngle(gameState, impact);
		gameState.ballVel.x = Math.sqrt(1 - angle ** 2) * gameState.speed;
		if (!wallCollision) {
			gameState.ballVel.y = angle * gameState.speed;
		}
	}

	// (Player 2) right
	if (
		gameState.ball.x + ballSizeX >= 100 - paddleWidth &&
		ballCenterY >= gameState.paddles.p2 - HitBoxBuffer &&
		ballCenterY <= gameState.paddles.p2 + paddleHeight
	) {
		const paddleCenterY = gameState.paddles.p2 + paddleHeight / 2;
		const impact = (ballCenterY - paddleCenterY) / (paddleHeight / 2);
		const angle = getImpactAngle(gameState, impact);
		gameState.ballVel.x = -Math.sqrt(1 - angle ** 2) * gameState.speed;
		if (!wallCollision) {
			gameState.ballVel.y = angle * gameState.speed;
		}
	}
	//AI Game
	if (gameState.aiGame)
		aiMove(gameState, handleInput);
}


function updateBall4Players(gameState) {
	gameState.ball.x += gameState.ballVel.x;
	gameState.ball.y += gameState.ballVel.y;

	// Wall collision
	if (gameState.ball.y <= 0 || gameState.ball.y + ballSizeY >= 100) {
		gameState.ballVel.y *= -1;
	}

	// Scoring: reset
	if (gameState.ball.x + ballSizeX <= 0 || gameState.ball.x >= 100) {
		if (gameState.ball.x + ballSizeX <= 0)
			gameState.score.p2 += 1;
		else
			gameState.score.p1 += 1;
		gameState.numbrBalls -= 1;
		resetBall(gameState);
		return;
	}

	if ((gameState.score.p2 === 10 || gameState.score.p1 === 10) && gameState.onGoing ) {
		gameState.winnerId = gameState.playerId.p1;
		if (gameState.score.p1 < gameState.score.p2)
			gameState.winnerId = gameState.playerId.p2;
		insertOnDb(gameState);
		gameState.onGoing = false;
		gameState.finished= true;
	}

	// Calculate center Y of ball
	const ballCenterY = gameState.ball.y + ballSizeY / 2;

	// (Player 1 ) left
	if (
		gameState.ballVel.x < 0 &&
		gameState.ball.x <= paddleWidth &&
		ballCenterY >= gameState.paddles.p1 - HitBoxBuffer &&
		ballCenterY <= gameState.paddles.p1 + paddleHeight
	) {
		const paddleCenterY = gameState.paddles.p1 + paddleHeight / 2;
		const impact = (ballCenterY - paddleCenterY) / (paddleHeight / 2);
		const angle = getImpactAngle(gameState, impact);
		gameState.ballVel.x = Math.sqrt(1 - angle ** 2) * gameState.speed;
		gameState.ballVel.y = angle * gameState.speed;
	}
	// (Player 3) left
	if (
		gameState.ballVel.x < 0 &&
		gameState.ball.x + ballSizeX >= paddle3X &&  // ball right >= paddle left
		gameState.ball.x <= paddle3X + paddleWidth && // ball left <= paddle right
		ballCenterY >= gameState.paddles.p3 - HitBoxBuffer &&
		ballCenterY <= gameState.paddles.p3 + paddleHeight
		
	) {
		const paddleCenterY = gameState.paddles.p3 + paddleHeight / 2;
		const impact = (ballCenterY - paddleCenterY) / (paddleHeight / 2);
		const angle = getImpactAngle(gameState, impact);
		gameState.ballVel.x = Math.sqrt(1 - angle ** 2) * gameState.speed;
		gameState.ballVel.y = angle * gameState.speed;
	}

	// (Player 2) right
	if (
		gameState.ballVel.x > 0 &&
		gameState.ball.x + ballSizeX >= 100 - paddleWidth &&
		ballCenterY >= gameState.paddles.p2 - HitBoxBuffer &&
		ballCenterY <= gameState.paddles.p2 + paddleHeight
	) {
		const paddleCenterY = gameState.paddles.p2 + paddleHeight / 2;
		const impact = (ballCenterY - paddleCenterY) / (paddleHeight / 2);
		const angle = getImpactAngle(gameState, impact);
		gameState.ballVel.x = -Math.sqrt(1 - angle ** 2) * gameState.speed;
		gameState.ballVel.y = angle * gameState.speed;
	}
	// (Player4) right
	if (
		gameState.ballVel.x > 0 &&
		gameState.ball.x <= paddle4X + paddleWidth && // ball left <= paddle right
		gameState.ball.x + ballSizeX >= paddle4X &&   // ball right >= paddle left
		ballCenterY >= gameState.paddles.p4 - HitBoxBuffer &&
		ballCenterY <= gameState.paddles.p4 + paddleHeight
	) {
		const paddleCenterY = gameState.paddles.p4 + paddleHeight / 2;
		const impact = (ballCenterY - paddleCenterY) / (paddleHeight / 2);
		const angle = getImpactAngle(gameState, impact);
		gameState.ballVel.x = -Math.sqrt(1 - angle ** 2) * gameState.speed;
		gameState.ballVel.y = angle * gameState.speed;
	}

}

function insertOnDb(gameState)
{
	if (gameState.GamePlayLocal || gameState.aiGame)
		return ;
	if(gameState.playerDbId.p1 === null || gameState.playerDbId.p2 === null)
		return ;
	insertMatch(gameState.playerDbId.p1, gameState.playerDbId.p2, gameState.winnerId, gameState.score.p1, gameState.score.p2);
	if (gameState.playerDbId.p3 != 0)
	{
		if (gameState.score.p1 > gameState.score.p2)
			insertMatch(gameState.playerDbId.p3, gameState.playerDbId.p4, gameState.playerDbId.p3, gameState.score.p1, gameState.score.p2);
		else
			insertMatch(gameState.playerDbId.p3, gameState.playerDbId.p4, gameState.playerDbId.p4, gameState.score.p1, gameState.score.p2);
	}
		
}


module.exports = {
	updateBall,
	updateBall4Players,
	handleInput,
	createInitialGameState
};
