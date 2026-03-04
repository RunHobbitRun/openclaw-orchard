#!/usr/bin/env node
/**
 * X (Twitter) Read-Only Scraper
 */

import fs from 'fs';
import axios from 'axios';
import path from 'path';

const workspace = process.env.OPENCLAW_WORKSPACE || path.join(process.env.HOME, '.openclaw');
const TOKEN_PATH = process.env.X_TOKEN_PATH || path.join(workspace, '.x_token');
const API_BASE = 'https://api.twitter.com/2';

function loadToken() {
    try {
        if (!fs.existsSync(TOKEN_PATH)) { return process.env.X_TOKEN; }
        const content = fs.readFileSync(TOKEN_PATH, 'utf8').trim();
        try {
            return JSON.parse(content).token || content;
        } catch { return content; }
    } catch (e) { return null; }
}

async function xApiRequest(endpoint, params = {}) {
    const token = loadToken();
    if (!token) { throw new Error('No X token available'); }

    try {
        const res = await axios.get(`${API_BASE}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params,
            timeout: 10000
        });
        return res.data;
    } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 429) {
            return { mock: true, error: err.response.status, endpoint };
        }
        throw err;
    }
}

const commands = {
    search: async (args) => {
        const query = args.join(' ');
        if (!query) { throw new Error('Usage: x-scraper search <query>'); }
        const data = await xApiRequest('/tweets/search/recent', { query, max_results: 15 });
        console.log(JSON.stringify(data.data || [], null, 2));
    }
};

const cmd = process.argv[2];
const args = process.argv.slice(3);
if (commands[cmd]) { await commands[cmd](args); }
else { console.log("Usage: node x-scraper.mjs search <query>"); }
