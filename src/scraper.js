const axios = require('axios');
const cheerio = require('cheerio');

async function fetchSalesData() {
    console.log("Starting Steamworks web scraper...");

    try {
        const targetUrl = 'https://partner.steamgames.com/doc/marketing/upcoming_events';

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        const $ = cheerio.load(response.data);
        const newSales = [];


        $('table tr').each((index, element) => {
            if (index === 0) return;

            const name = $(element).find('td').eq(0).text().trim();
            const rawDate = $(element).find('td').eq(1).text().trim();

            if (name && rawDate && (name.includes('Sale') || name.includes('Fest'))) {
                const formattedDate = formatSteamworksDate(rawDate);

                newSales.push({ name, date: formattedDate });
            }
        });

        console.log(`Successfully parsed ${newSales.length} sales events from Steamworks.`);
        return newSales;

    } catch (error) {
        console.error("Web scraping failed:", error.message);
        return [];
    }
}


function formatSteamworksDate(rawDateString) {
    return "00.00-00.00";
}

module.exports = { fetchSalesData };