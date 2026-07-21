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

bot.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const now = new Date();
  const currentYear = now.getFullYear();

  const parseDate = (dateStr) => {
    const [day, month] = dateStr.split('.');
    return new Date(currentYear, parseInt(month) - 1, parseInt(day));
  };

  if (command === 'list') {
    console.log(`Command !list executed by ${message.author.tag}`);
    let response = "**Розклад розпродажів Steam:**\n";
    steamSales.forEach(sale => {
      response += `• **${sale.name}**: ${sale.date}\n`;
    });
    message.channel.send(response);
  }

  else if (command === 'orpheus') {
    console.log(`Command !orpheus executed by ${message.author.tag}`);
    message.channel.send("https://tenor.com/view/persona3-orpheus-gif-22389944");
  }

  else if (command === 'recent') {
    console.log(`Command !recent executed by ${message.author.tag}`);

    const activeSale = steamSales.find(sale => {
      const [startStr, endStr] = sale.date.split('-');
      const startDate = parseDate(startStr);
      let endDate = parseDate(endStr);

      if (endDate < startDate) {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      return now >= startDate && now <= endDate;
    });

    if (activeSale) {
      message.channel.send(`Зараз проходить **${activeSale.name}**! Він триватиме до ${activeSale.date.split('-')[1]}.`);
    } else {
      message.channel.send("Наразі немає активних розпродажів.");
    }
  }

  else if (command === 'next') {
    console.log(`Command !next executed by ${message.author.tag}`);

    const nextSale = steamSales.find(sale => {
      const startDate = parseDate(sale.date.split('-')[0]);
      return startDate > now;
    });

    if (nextSale) {
      message.channel.send(`Наступний розпродаж: **${nextSale.name}**. Почнеться ${nextSale.date.split('-')[0]}.`);
    } else {
      message.channel.send("У цьому році більше не заплановано розпродажів.");
    }
  }
});

bot.login(process.env.DISCORD_TOKEN);