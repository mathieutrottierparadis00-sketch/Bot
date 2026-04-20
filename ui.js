const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

function lobbyEmbed(game) {
  return new EmbedBuilder()
    .setTitle("🍻 Habs Watch Party")
    .setDescription(
      `Host: <@${game.hostId}>\n\n` +
      `Players (${game.players.length}/7):\n` +
      game.players.map(p => `- <@${p}>`).join("\n") +
      `\n\nStatus: Lobby`
    )
    .setColor("Red");
}

function lobbyButtons(game, userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("join")
      .setLabel("Join")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("leave")
      .setLabel("Leave")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("start")
      .setLabel("Start Game")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(userId !== game.hostId)
  );
}

function liveEmbed(game, scoreText) {
  return new EmbedBuilder()
    .setTitle("🏒 LIVE GAME")
    .setDescription(scoreText + "\n\n🍺 Drinking rules active")
    .setColor("Blue");
}

module.exports = {
  lobbyEmbed,
  lobbyButtons,
  liveEmbed
};
