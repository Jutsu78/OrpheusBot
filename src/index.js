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

bot.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${bot.user.username}`);
    
    try {
        const channel = await bot.channels.fetch("1529130651993899190");
        await channel.send("@everyone Hello, world! (test).");
        console.log("Startup message sent successfully.");
    } catch (error) {
        console.error("Failed to find the channel or send the message:", error);
    }
});

bot.login(process.env.DISCORD_TOKEN);