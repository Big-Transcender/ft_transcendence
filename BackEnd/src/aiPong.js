// aiPong.js
// AI for Pong that "refreshes vision" once per second and simulates keyboard input.
//
// Usage: const { aiMove } = require('./aiPong');
// updateBall will call aiMove(gameState, handleInput);

const BALL_SIZE_X = (33 / 900) * 100;
const BALL_SIZE_Y = (33 / 500) * 100;
const PADDLE_WIDTH = (20 / 900) * 100;
const PADDLE_HEIGHT = (75 / 500) * 100 + 3; // matches your paddleHeight + HitBoxBuffer

// tunables for difficulty / behavior
const VISION_INTERVAL_MS = 1000; // AI "looks" once per second
const REACTION_JITTER_MS = 120; // small random reaction jitter when starting a new movement
const AIM_ERROR = 3.0; // how many percent points of Y the AI might miss by (human error)
const MAX_SIM_STEPS = 2000; // safety cap for trajectory simulation

// internal state (module-scoped so it persists across calls)
let lastVisionTimestamp = 0;
let lastSnapshot = null; // {ball, ballVel, timestamp}
let predictedTargetY = 50; // target center Y (in percent)
let nextActionTime = 0; // to simulate reaction delay

// Utility: deep-ish clone of the small parts we need so we only "see" once per second
function takeSnapshot(gs) {
    return {
        t: Date.now(),
        ball: { x: gs.ball.x, y: gs.ball.y },
        ballVel: { x: gs.ballVel.x, y: gs.ballVel.y },
        paddles: { ...gs.paddles }, // in case we want to use paddle positions for strategy
        speed: gs.speed,
        aiControls: determineAiPaddleKey(gs) // for reference
    };
}

// Determine which paddle the AI should control.
// Your code uses aiMove when gameState.aiGame is true and seems to expect AI on right (p2).
// We'll assume AI controls p2. If you want it to control another, change here.
function determineAiPaddleKey(gs) {
    // return 'p2' by default; change to 'p4' or 'p3' if you want different behavior
    return 'p2';
}

// Predict where the ball's CENTER Y will be when it reaches the AI paddle X
// This simulation only accounts for vertical wall bounces (top/bottom).
function predictBallInterceptY(snapshot, aiPaddleKey = 'p2') {
    // copy numeric values
    let x = snapshot.ball.x;
    let y = snapshot.ball.y;
    let vx = snapshot.ballVel.x;
    let vy = snapshot.ballVel.y;

    // center Y of ball
    const halfBall = BALL_SIZE_Y / 2;

    // Where is the AI paddle on X (we use same constants your game uses)
    const paddleRightX = 100 - PADDLE_WIDTH; // left edge of right paddle area
    const targetX = paddleRightX - BALL_SIZE_X; // x at which ball is considered hitting paddle (ball.right >= paddleLeft)
    // If vx is negative (ball moving left) it might still be bouncing off walls and reversing later.
    // We'll simulate until the ball reaches the targetX while moving right, or until some steps cap.

    // If ball is already beyond target and moving right, just return current center
    if (vx > 0 && x + BALL_SIZE_X >= targetX) {
        return y + halfBall;
    }

    // Simulate position step-by-step using the game's per-tick steps (vel is percent per tick)
    // We don't know tick frequency; but your game updates positions by adding vel each call,
    // so simulating by adding vx/vy per step is correct in units.
    let steps = 0;
    while (steps < MAX_SIM_STEPS) {
        steps += 1;
        x += vx;
        y += vy;

        // vertical reflection
        if (y <= 0) {
            y = -y;
            vy = -vy;
        } else if (y + BALL_SIZE_Y >= 100) {
            y = 2 * (100 - BALL_SIZE_Y) - y;
            vy = -vy;
        }

        // if the ball is moving right and its right edge >= targetX (approx collision with paddle plane)
        if (vx > 0 && (x + BALL_SIZE_X) >= targetX) {
            // return center Y at this time
            return y + halfBall;
        }

        // if the ball is moving left and somehow crosses targetX we keep simulating --
        // maybe it will bounce off left paddle and come back; but we are not simulating player paddle deflections.
        // To keep things reasonable, if vx < 0 and x <= 0 - BALL_SIZE_X*2 then it's gone -- break and return center
        if (x + BALL_SIZE_X <= 0 || x >= 100 + BALL_SIZE_X) {
            // ball scored / left playfield; return current center
            return y + halfBall;
        }

        // If velocity is near zero (rare) break
        if (Math.abs(vx) < 1e-6 && Math.abs(vy) < 1e-6) {
            break;
        }
    }

    // Fallback
    return y + halfBall;
}

// Make the AI produce keyboard inputs (simulate pressing ArrowUp / ArrowDown).
// We'll call handleInput each tick with an array containing one key (or empty array).
function pressKeysForMovement(handleInputFn, gs, desiredCenterY, paddleKeyName) {
    // paddleKeyName is 'p2' here; handleInputLocal uses ArrowUp / ArrowDown mapped to p2 when isAI true.
    // we only need to pass keys (ex: ['ArrowUp']) and isAI=true; handleInputLocal will route to p2.
    const currentPaddleTop = gs.paddles[paddleKeyName];
    const currentPaddleCenter = currentPaddleTop + (PADDLE_HEIGHT / 2);

    // threshold so AI doesn't jitter when essentially aligned
    const deadZone = 5; // percent points

    // Randomized aim error to simulate imperfection
    const error = (Math.random() - 0.5) * 2 * (AIM_ERROR); // +/- AIM_ERROR
    const targetWithError = desiredCenterY + error;

    // decide direction
    if (currentPaddleCenter + deadZone < targetWithError) {
        // move down
        handleInputFn(gs, null, ['ArrowDown'], true);
    } else if (currentPaddleCenter - deadZone > targetWithError) {
        // move up
        handleInputFn(gs, null, ['ArrowUp'], true);
    } else {
        // no input (stay)
        handleInputFn(gs, null, [], true);
    }
}

// Public function called from update loop
function aiMove(gameState, handleInput) {
    if (!gameState || !gameState.aiGame) return;

    const now = Date.now();
    const paddleKey = determineAiPaddleKey(gameState); // 'p2' by default

    // If this is the first call (no snapshot) or vision interval passed, take new snapshot & predict
    if (!lastSnapshot || (now - lastVisionTimestamp) >= VISION_INTERVAL_MS) {
        lastVisionTimestamp = now;
        // snapshot MUST be taken once per vision refresh — we do NOT read live values elsewhere when predicting
        lastSnapshot = takeSnapshot(gameState);

        // small reaction jitter to simulate human delay
        nextActionTime = now + Math.round((Math.random() * REACTION_JITTER_MS));

        // predict where ball will be when it reaches our paddle X
        const predictedCenter = predictBallInterceptY(lastSnapshot, paddleKey);

        // store predicted target (clamp to playable space [0,100])
        predictedTargetY = Math.max(0 + (BALL_SIZE_Y / 2), Math.min(100 - (BALL_SIZE_Y / 2), predictedCenter));
    }

    // If still in reaction delay, do nothing (simulate thinking)
    if (now < nextActionTime) {
        // send no keys (or minimal jitter)
        handleInput(gameState, null, [], true);
        return;
    }

    // Move the paddle toward predictedTargetY using keyboard simulation every tick.
    // We use only the previously computed predictedTargetY (no fresh reads)
    pressKeysForMovement(handleInput, gameState, predictedTargetY, paddleKey);

    // Minor tactic: if the ball is very close (within a handful of ticks), do a last-second small adjustment
    // Determine approximate horizontal distance from last snapshot to paddle in "ticks"
    const snap = lastSnapshot;
    if (snap && snap.ballVel && Math.abs(snap.ballVel.x) > 0.0001) {
        const distanceX = (100 - PADDLE_WIDTH) - (snap.ball.x + BALL_SIZE_X);
        const approxTicks = Math.abs(distanceX / snap.ballVel.x);
        if (approxTicks > 0 && approxTicks < 6) {
            // in last few ticks: reduce AIM_ERROR so AI is more accurate at close range
            // by reducing error via quick re-alignment attempt (we still must not "see" again)
            // Move aggressively if off-center
            const currentCenter = gameState.paddles[paddleKey] + (PADDLE_HEIGHT / 2);
            // smaller deadzone
            if (currentCenter + 0.6 < predictedTargetY) {
                handleInput(gameState, null, ['ArrowDown'], true);
            } else if (currentCenter - 0.6 > predictedTargetY) {
                handleInput(gameState, null, ['ArrowUp'], true);
            }
        }
    }
}

module.exports = { aiMove };
