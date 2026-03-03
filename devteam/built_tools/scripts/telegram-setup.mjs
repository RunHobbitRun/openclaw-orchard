#!/usr/bin/env node
/**
 * Telegram Bot Setup Utility
 * Helps configure and test the Telegram bot
 */

import { Telegraf } from 'telegraf';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN required. Set it in your environment.');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

async function getBotInfo() {
    try {
        const me = await bot.telegram.getMe();
        console.log(`🤖 Bot: ${me.username} (${me.id})`);
        return me;
    } catch (error) {
        console.error('❌ Failed to get bot info:', error.message);
        process.exit(1);
    }
}

async function listUpdates() {
    try {
        console.log('📥 Fetching recent updates...');
        const updates = await bot.telegram.getUpdates({ offset: -1, limit: 10 });
        console.log(`Found ${updates.length} updates`);
        updates.forEach((u, i) => {
            if (u.message) {
                console.log(`  ${i + 1}. [${u.message.from.first_name}] ${u.message.text?.substring(0, 50) || '(no text)'}`);
            }
        });
        return updates;
    } catch (error) {
        console.error('❌ Failed to fetch updates:', error.message);
        return [];
    }
}

async function runInteractiveChat() {
    console.log('💬 Starting interactive chat test...');
    console.log('Send messages to your bot to see them here.');
    console.log('Press Ctrl+C to exit.\n');
    
    bot.use(async (ctx) => {
        if (ctx.message && ctx.message.text) {
            console.log(`📩 Received: "${ctx.message.text}" from ${ctx.message.from.first_name}`);
            await ctx.reply(`Echo: ${ctx.message.text}`);
        }
    });
    
    bot.launch();
    
    process.once('SIGINT', () => {
        bot.stop('SIGINT');
        process.exit(0);
    });
    
    process.once('SIGTERM', () => {
        bot.stop('SIGTERM');
        process.exit(0);
    });
}

/**
 * Start bot in polling mode (for inbound commands)
 */
function startBot() {
    bot.launch();
    console.log('✅ Telegram bot started (polling mode)');
    console.log('🤖 Waiting for messages...\n');
    
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

// Main
async function main() {
    console.log('🤖 Telegram Bot Setup Utility');
    console.log('=============================\n');
    
    const cmd = process.argv[2] || 'help';
    
    switch (cmd) {
        case 'info':
            await getBotInfo();
            break;
            
        case 'check':
            await getBotInfo();
            await listUpdates();
            break;
            
        case 'poll':
            console.log('Starting bot in polling mode...');
            startBot();
            break;
            
        case 'test':
            await getBotInfo();
            await runInteractiveChat();
            break;
            
        case 'help':
        default:
            console.log('Usage: node telegram-setup.mjs <command>\n');
            console.log('Commands:');
            console.log('  info    - Show bot information');
            console.log('  check   - Show bot info + recent updates');
            console.log('  poll    - Start bot in polling mode (echo mode)');
            console.log('  test    - Start interactive test chat\n');
    }
}

main();
