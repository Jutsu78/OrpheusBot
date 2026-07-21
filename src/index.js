require('dotenv').config();
const cron = require('node-cron');
const { Client, GatewayIntentBits, Events } = require("discord.js");
const { fetchSalesData } = require('./scraper.js');

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

let dynamicSteamSales = [];

const getSaleDates = (dateStr) => {
  try {
    const yearMatch = dateStr.match(/,\s*(\d{4})/);
    const endYear = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

    const withoutYear = dateStr.replace(/,\s*\d{4}/, '').trim();
    const parts = withoutYear.split('-');

    if (parts.length !== 2) return null;

    const startStr = parts[0].trim();
    const endStr = parts[1].trim();

    const endDate = new Date(`${endStr}, ${endYear}`);
    let startDate = new Date(`${startStr}, ${endYear}`);

    if (startDate > endDate) {
      startDate.setFullYear(endYear - 1);
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
};

bot.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${bot.user.username}`);

  console.log("Fetching initial sales data...");
  const initialData = await fetchSalesData();
  if (initialData.length > 0) {
    dynamicSteamSales = initialData;
  }

  cron.schedule('0 3 * * 1', async () => {
    console.log("Running weekly background data update...");
    const updatedData = await fetchSalesData();
    if (updatedData.length > 0) {
      dynamicSteamSales = updatedData;
      console.log("In-memory sales data refreshed successfully.");
    }
  }, {
    timezone: "Europe/Kyiv"
  });

  cron.schedule('0 20 * * *', async () => {
    console.log("Running daily Steam sale check...");

    try {
      const channel = await bot.channels.fetch("1529130651993899190");

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeSale = dynamicSteamSales.find(sale => {
        const dates = getSaleDates(sale.date);
        if (!dates) return false;
        return dates.startDate.getTime() === today.getTime();
      });

      if (activeSale) {
        const endDateStr = activeSale.date.split('-')[1].trim();
        await channel.send(`@everyone Увага! Почався **${activeSale.name}**! Він триватиме до ${endDateStr}.`);
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

bot.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const now = new Date();

  if (command === 'list') {
    console.log(`Command !list executed by ${message.author.tag}`);
    let response = "**Розклад розпродажів Steam:**\n";

    if (dynamicSteamSales.length === 0) {
      response += "Наразі немає даних про розпродажі.\n";
    } else {
      dynamicSteamSales.forEach(sale => {
        response += `• **${sale.name}**: ${sale.date}\n`;
      });
    }
    message.channel.send(response);
  }

  else if (command === 'orpheus') {
    console.log(`Command !orpheus executed by ${message.author.tag}`);
    message.channel.send("https://tenor.com/view/persona3-orpheus-gif-22389944");
  }

  else if (command === 'recent') {
    console.log(`Command !recent executed by ${message.author.tag}`);

    const activeSale = dynamicSteamSales.find(sale => {
      const dates = getSaleDates(sale.date);
      if (!dates) return false;
      return now >= dates.startDate && now <= dates.endDate;
    });

    if (activeSale) {
      const endDateStr = activeSale.date.split('-')[1].trim();
      message.channel.send(`Зараз проходить **${activeSale.name}**! Він триватиме до ${endDateStr}.`);
    } else {
      message.channel.send("Наразі немає активних розпродажів.");
    }
  }

  else if (command === 'next') {
    console.log(`Command !next executed by ${message.author.tag}`);

    const nextSale = dynamicSteamSales.find(sale => {
      const dates = getSaleDates(sale.date);
      if (!dates) return false;
      return dates.startDate > now;
    });

    if (nextSale) {

      const startDateStr = nextSale.date.split('-')[0].trim();
      message.channel.send(`Наступний розпродаж: **${nextSale.name}**. Почнеться ${startDateStr}.`);
    } else {
      message.channel.send("У цьому році більше не заплановано розпродажів.");
    }
  }
});

bot.login(process.env.DISCORD_TOKEN);