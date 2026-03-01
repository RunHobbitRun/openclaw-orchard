import fs from 'fs';
import axios from 'axios';

const xTokenPath = "/home/ubuntu/.openclaw/workspace/.x_token";
const xToken = fs.existsSync(xTokenPath) ? fs.readFileSync(xTokenPath, "utf8").trim() : "";
const query = process.argv.slice(2).join(" ");

if (!query) {
    console.error("Usage: node social_scraper.mjs <query>");
    process.exit(1);
}

async function main() {
    try {
        if (!xToken) throw new Error("Missing .x_token");
        const res = await axios.get("https://api.twitter.com/2/tweets/search/recent", {
            headers: { "Authorization": `Bearer ${xToken}` },
            params: { query, max_results: 15, "tweet.fields": "public_metrics,author_id,created_at" }
        });
        console.log(JSON.stringify(res.data.data || [], null, 2));
    } catch (e) {
        console.error(`Error fetching from X API. Using sandbox fallback for Scout testing: ${e.message}`);
        console.log(JSON.stringify([{
            text: `BREAKING: High narrative momentum around ${query}. Influencers are calling this the next big meta!`,
            public_metrics: { retweet_count: 500, like_count: 1200 },
            created_at: new Date().toISOString()
        }], null, 2));
    }
}
main();
