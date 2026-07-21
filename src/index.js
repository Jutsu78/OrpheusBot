require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

bot.once(Events.ClientReady, () => {
  console.log(`Logged in as ${bot.user.username}`);
});

bot.login(process.env.DISCORD_TOKEN);