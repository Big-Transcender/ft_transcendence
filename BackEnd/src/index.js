const Fastify = require('fastify');
const routes = require('./routes');
const cors = require('@fastify/cors');

const path = require('path');
const fastifyStatic = require('@fastify/static');

const WebSocket = require('ws');
const {
  updateBall,
  handleInput,
  getGameState
} = require('./gameLogic');

const fastify = Fastify({ logger: true });

async function start() {
  try {
    await fastify.register(cors, { origin: '*' });

    const httpServer = fastify.server;
    const wss = new WebSocket.Server({ server: httpServer });

    const players = new Map(); // ws -> playerId
    let availablePlayers = ['p1', 'p2'];

    wss.on('connection', (ws) => {
      let assignedPlayer = null;
      if (availablePlayers.length > 0) {
        assignedPlayer = availablePlayers.shift();
        players.set(ws, assignedPlayer);
        console.log(`New connection assigned to ${assignedPlayer}`);

        // Inform frontend of assigned player
        ws.send(JSON.stringify({ type: 'assign', payload: assignedPlayer }));
      } else {
        console.log('⚠️ More than 2 players connected. No playerId assigned.');
      }

      ws.send(JSON.stringify({ type: 'state', payload: getGameState() }));

      ws.on('message', (message) => {
        let parsed;
        try {
          parsed = JSON.parse(message.toString());
        } catch {
          console.warn('Invalid JSON:', message.toString());
          return;
        }

        if (parsed.type === 'input') {
          const keys = Array.isArray(parsed.payload) ? parsed.payload : [parsed.payload];
          const playerId = players.get(ws);
          if (playerId) {
            handleInput(playerId, keys);
          }
        }
      });

      ws.on('close', () => {
        const playerId = players.get(ws);
        console.log(`Connection for ${playerId} closed`);
        players.delete(ws);
        if (playerId && !availablePlayers.includes(playerId)) {
          availablePlayers.push(playerId);
          availablePlayers.sort(); // Ensure 'p1' is before 'p2'
        }
      });
    });

    // Game loop
    setInterval(() => {
      updateBall();
      const gameState = getGameState();
      const message = JSON.stringify({ type: 'state', payload: gameState });

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }, 15); // 60 FPS

    fastify.register(routes);
    fastify.register(fastifyStatic, {
      root: path.join(__dirname, '../frontEnd'),
      prefix: '/',
    });

    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('✅ Server started at http://localhost:3000');
  } catch (error) {
    console.error('❌ Failed to start:', error);
    process.exit(1);
  }
}

start();