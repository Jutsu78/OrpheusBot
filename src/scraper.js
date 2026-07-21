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

        $('h2.bb_subsection').each((index, element) => {
            const text = $(element).text().trim();
            if (text.includes('|') && (text.includes('Sale') || text.includes('Fest'))) {
                const [nameRaw, dateRaw] = text.split('|');

                const name = nameRaw.trim();
                const date = dateRaw.trim(); 

                newSales.push({ name, date });
            }
        });

        console.log(`Successfully parsed ${newSales.length} sales events from Steamworks.`);
        return newSales;

    } catch (error) {
        console.error("Web scraping failed:", error.message);
        return [];
    }
}

module.exports = { fetchSalesData };