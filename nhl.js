const axios = require("axios");

async function getTodaySchedule() {
  const date = new Date().toISOString().split("T")[0];

  const res = await axios.get(
    `https://api-web.nhle.com/v1/schedule/${date}`
  );

  return res.data;
}

async function getLiveGame(gameId) {
  const res = await axios.get(
    `https://api-web.nhle.com/v1/gamecenter/${gameId}/landing`
  );

  return res.data;
}

module.exports = {
  getTodaySchedule,
  getLiveGame
};
