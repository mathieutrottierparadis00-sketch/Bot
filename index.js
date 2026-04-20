require("dotenv").config();

const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const game = require("./game");
const state = require("./state");
const ui = require("./ui");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log("🍻 Bot ready");
});

// 🎮 START MENU (NO COMMAND SYSTEM)
client.on("messageCreate", async (msg) => {
  if (msg.content === "!watchparty") {

    const sent = await msg.channel.send({
      embeds: [
        ui.lobbyEmbed({
          hostId: msg.author.id,
          players: [msg.author.id]
        })
      ],
      components: [
        ui.lobbyButtons(
          { hostId: msg.author.id, players: [msg.author.id] },
          msg.author.id
        )
      ]
    });

    game.createGame(msg.author.id, msg.channel.id, sent);
  }
});

// 🎛 BUTTONS
client.on("interactionCreate", async (i) => {
  if (!i.isButton()) return;

  const g = state.getGame();
  if (!g) return;

  if (i.customId === "join") game.addPlayer(i.user.id);
  if (i.customId === "leave") game.removePlayer(i.user.id);

  if (i.customId === "start") {
    if (g.players.length === 1) {
      g.players.push("BOT_PLAYER"); // 🧪 SOLO TEST MODE
    }

    await game.startGame(client);
    await i.reply("🏒 Game started!");
  }

  const updated = state.getGame();

  await i.message.edit({
    embeds: [ui.lobbyEmbed(updated)],
    components: [ui.lobbyButtons(updated, updated.hostId)]
  });

  i.deferUpdate();
});

client.login(process.env.TOKEN);
