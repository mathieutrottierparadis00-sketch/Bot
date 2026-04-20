const state = require("./state");
const { getTodaySchedule, getLiveGame } = require("./nhl");

function createGame(hostId, channelId, message) {
  state.setGame({
    hostId,
    channelId,
    messageId: message.id,
    players: [hostId],
    status: "lobby",
    gameId: null,
    lastState: null,
    client: null
  });
}

function addPlayer(id) {
  const g = state.getGame();
  if (!g.players.includes(id)) g.players.push(id);
}

function removePlayer(id) {
  const g = state.getGame();
  g.players = g.players.filter(p => p !== id);
}

async function startGame(client) {
  const g = state.getGame();
  g.client = client;

  // 🔎 find Habs game
  const schedule = await getTodaySchedule();
  let match = null;

  for (const day of schedule.gameWeek) {
    for (const game of day.games) {
      if (
        game.homeTeam.abbrev === "MTL" ||
        game.awayTeam.abbrev === "MTL"
      ) {
        match = game;
      }
    }
  }

  if (!match) throw new Error("No Habs game found");

  g.gameId = match.id;
  g.status = "live";

  startPolling();
  startTimers();
}

function startPolling() {
  setInterval(async () => {
    const g = state.getGame();
    if (!g || !g.gameId) return;

    const data = await getLiveGame(g.gameId);

    detectEvents(data);
    g.lastState = data;
  }, 30000);
}

function startTimers() {
  const g = state.getGame();

  // 🎲 every 4 min random drink
  setInterval(() => {
    randomDrink();
  }, 240000);
}

function detectEvents(newState) {
  const g = state.getGame();
  const old = g.lastState;
  if (!old) return;

  const client = g.client;
  const channel = client.channels.cache.get(g.channelId);

  // 🥅 goal for
  if (newState.goals.home > old.goals.home) {
    channel.send("🍺 GOAL HABS → everyone drinks!");
  }

  // 🚨 goal against
  if (newState.goals.away > old.goals.away) {
    channel.send("🍺 GOAL AGAINST → everyone drinks!");
  }

  // 🟥 penalty
  if (newState.penalties.length > old.penalties.length) {
    channel.send("🍺 PENALTY → everyone drinks!");
  }
}

function randomDrink() {
  const g = state.getGame();
  const client = g.client;

  if (!g.players.length) return;

  const player =
    g.players[Math.floor(Math.random() * g.players.length)];

  const channel = client.channels.cache.get(g.channelId);

  channel.send(`🎲 <@${player}> drinks alone 🍺`);
}

module.exports = {
  createGame,
  addPlayer,
  removePlayer,
  startGame
};
