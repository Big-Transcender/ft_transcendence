const BALL_SIZE_X = (33 / 900) * 100;
const BALL_SIZE_Y = (33 / 500) * 100;
const PADDLE_WIDTH = (20 / 900) * 100;
const PADDLE_HEIGHT = (75 / 500) * 100 + 3;

const VISION_INTERVAL_MS = 1000; // refresh view once per second
const REACTION_JITTER_MS = 40; // slightly lower, reacts quicker
const AIM_ERROR_BASE = 1.5; // smaller base error for better precision
const MAX_SIM_STEPS = 3000;

let lastVisionTimestamp = 0;
let lastSnapshot = null;
let predictedTargetY = 50;
let nextActionTime = 0;

const AI_INPUT_INTERVAL_MS = 16; 
let lastAIInputTime = 0;

// Deep-ish clone for "vision"
function takeSnapshot(gs) {
	return {
		t: Date.now(),
		ball: { x: gs.ball.x, y: gs.ball.y },
		ballVel: { x: gs.ballVel.x, y: gs.ballVel.y },
		paddles: { ...gs.paddles },
		speed: gs.speed,
		aiControls: 'p2'
	};
}

// Better prediction: simulates all wall bounces until ball reaches AI paddle
function predictBallInterceptY(snapshot, aiPaddleKey = 'p2') {
	let x = snapshot.ball.x;
	let y = snapshot.ball.y;
	let vx = snapshot.ballVel.x;
	let vy = snapshot.ballVel.y;

	const halfBall = BALL_SIZE_Y / 2;
	const paddleRightX = 100 - PADDLE_WIDTH;
	const targetX = paddleRightX - BALL_SIZE_X;

	let steps = 0;
	while (steps < MAX_SIM_STEPS) {
		steps++;
		x += vx;
		y += vy;

		// vertical bounces
		if (y <= 0) {
			y = -y;
			vy = -vy;
		} else if (y + BALL_SIZE_Y >= 100) {
			y = 2 * (100 - BALL_SIZE_Y) - y;
			vy = -vy;
		}

		// AI paddle collision plane
		if (vx > 0 && (x + BALL_SIZE_X) >= targetX) {
			return y + halfBall;
		}

		// stop if ball goes off field
		if (x + BALL_SIZE_X <= 0 || x >= 100 + BALL_SIZE_X) {
			return y + halfBall;
		}
	}
	return y + halfBall;
}

let aiCurrentDir = null; // 'up', 'down', or null

function pressKeysForMovementStatic(handleInputFn, gs, desiredCenterY, paddleKeyName) {
	const currentPaddleTop = gs.paddles[paddleKeyName];
	const currentPaddleCenter = currentPaddleTop + (PADDLE_HEIGHT / 2);

	const deadZone = 2.5;

	// If we're already in dead zone, stop
	if (Math.abs(currentPaddleCenter - desiredCenterY) <= deadZone) {
		aiCurrentDir = null;
		handleInputFn(gs, null, [], true);
		return;
	}

	// If no direction yet, pick one based on current position
	if (!aiCurrentDir) {
		aiCurrentDir = currentPaddleCenter < desiredCenterY ? 'down' : 'up';
	}

	// Continue moving in chosen direction until target reached
	if (aiCurrentDir === 'down') {
		if (currentPaddleCenter < desiredCenterY - deadZone) {
			handleInputFn(gs, null, ['ArrowDown'], true);
		} else {
			aiCurrentDir = null;
			handleInputFn(gs, null, [], true);
		}
	} else if (aiCurrentDir === 'up') {
		if (currentPaddleCenter > desiredCenterY + deadZone) {
			handleInputFn(gs, null, ['ArrowUp'], true);
		} else {
			aiCurrentDir = null;
			handleInputFn(gs, null, [], true);
		}
	}
}

function aiMove(gameState, handleInput) {
	if (!gameState || !gameState.aiGame) return;

	const now = Date.now();
	const paddleKey = 'p2';

	// Match player input frequency
	if (now - lastAIInputTime < AI_INPUT_INTERVAL_MS) return;
	lastAIInputTime = now;

	// Refresh vision once per second
	if (!lastSnapshot || (now - lastVisionTimestamp) >= VISION_INTERVAL_MS) {
		lastVisionTimestamp = now;
		lastSnapshot = takeSnapshot(gameState);
		nextActionTime = now + Math.round(Math.random() * REACTION_JITTER_MS);

		// Improved prediction
		const predictedCenter = predictBallInterceptY(lastSnapshot, paddleKey);
		predictedTargetY = Math.max(BALL_SIZE_Y / 2, Math.min(100 - BALL_SIZE_Y / 2, predictedCenter));

		// Reset direction so new target is evaluated
		aiCurrentDir = null;
	}

	// Simulate thinking delay
	if (now < nextActionTime) {
		handleInput(gameState, null, [], true);
		return;
	}

	// Move steadily toward predicted target without flicker
	pressKeysForMovementStatic(handleInput, gameState, predictedTargetY, paddleKey);
}


module.exports = { aiMove };
