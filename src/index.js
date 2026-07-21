require('dotenv').config();
const cron = require('node-cron');
const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");
const steamSales = require('./sales.js');

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
    cron.schedule('0 20 * * *', async () => {
        console.log("Running daily Steam sale check...");
        
        try {
            const channel = await bot.channels.fetch("1529130651993899190");
            await channel.send("@everyone Перевірка таймера! Бот прокинувся.");
            console.log("Timer message sent successfully.");
            
        } catch (error) {
            console.error("Failed to find the channel or send the message:", error);
        }
    }, {
        timezone: "Europe/Kyiv"
    });
});

bot.login(process.env.DISCORD_TOKEN);