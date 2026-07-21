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
                const rawDateString = dateRaw.trim();

                const formattedDate = formatSteamworksDate(rawDateString);

                if (formattedDate !== "00.00-00.00") {
                    newSales.push({ name, date: formattedDate });
                }
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
    const months = {
        "January": "01", "February": "02", "March": "03", "April": "04",
        "May": "05", "June": "06", "July": "07", "August": "08",
        "September": "09", "October": "10", "November": "11", "December": "12"
    };

    try {
        const withoutYear = rawDateString.replace(/,\s*\d{4}/g, '');

        const parts = withoutYear.split('-');
        if (parts.length !== 2) return "00.00-00.00";

        const startPart = parts[0].trim();
        const endPart = parts[1].trim();

        const parsePart = (str) => {
            const [monthName, dayStr] = str.split(' ');
            const month = months[monthName];
            const day = String(dayStr).padStart(2, '0');
            return month && day ? `${day}.${month}` : null;
        };

        const startFormatted = parsePart(startPart);
        const endFormatted = parsePart(endPart);

        if (startFormatted && endFormatted) {
            return `${startFormatted}-${endFormatted}`;
        }

        return "00.00-00.00";
    } catch (error) {
        console.error("Error formatting date string:", error.message);
        return "00.00-00.00";
    }
}

module.exports = { fetchSalesData };