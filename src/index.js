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

      const today = new Date();
      const currentDayMonth = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}`;

      const activeSale = steamSales.find(sale => {
        const startDate = sale.date.split('-')[0];
        return startDate === currentDayMonth;
      });

      if (activeSale) {
        const endDate = activeSale.date.split('-')[1];
        await channel.send(`@everyone Увага! Почався **${activeSale.name}**! Він триватиме до ${endDate}.`);
        console.log(`Sale message sent for: ${activeSale.name}`);
      } else {
        console.log("No Steam sales starting today.");
      }

    } catch (error) {
      console.error("Failed to find the channel or send the message:", error);
    }
  }, {
    timezone: "Europe/Kyiv"
  });
});

bot.login(process.env.DISCORD_TOKEN);