#!/usr/bin/env node
/**
 * Telegram Notifier Bot
 * Sends notifications to configured Telegram channels
 */

import { Telegraf } from 'telegraf';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MANAGER_CHAT_ID = process.env.TELEGRAM_MANAGER_CHAT_ID;
const AUDITOR_CHAT_ID = process.env.TELEGRAM_AUDITOR_CHAT_ID;
const FINANCE_CHAT_ID = process.env.TELEGRAM_FINANCE_CHAT_ID;

if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN required');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

async function sendMessageToChat(chatId, message, type = 'info') {
    if (!chatId) {
        console.warn(`⚠️ No chat ID configured for type: ${type}`);
        return null;
    }

    const prefix = {
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        task: '📋'
    }[type] || 'ℹ️';

    const fullMessage = `${prefix} ${message}`;

    try {
        await bot.telegram.sendMessage(chatId, fullMessage);
        console.log(`✅ Message sent to ${type} channel: ${message.substring(0, 50)}...`);
        return { success: true, chatId };
    } catch (error) {
        console.error(`❌ Failed to send to ${type} channel:`, error.message);
        return { success: false, error: error.message };
    }
}

export function notifyManager(message) {
    return sendMessageToChat(MANAGER_CHAT_ID, message, 'task');
}

export function notifyAuditor(message) {
    return sendMessageToChat(AUDITOR_CHAT_ID, message, 'warn');
}

export function notifyFinance(message) {
    return sendMessageToChat(FINANCE_CHAT_ID, message, 'info');
}

export function notifyChat(chatId, message, type = 'info') {
    return sendMessageToChat(chatId, message, type);
}

export function startBot() {
    bot.launch();
    console.log('🤖 Telegram bot started (polling mode)');
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('telegram-notifier.mjs')) {
    const msg = process.argv[2];
    const type = process.argv[3] || 'info';

    if (msg) {
        let targetId = MANAGER_CHAT_ID;
        if (type === 'warn') {targetId = AUDITOR_CHAT_ID;}
        if (type === 'finance') {targetId = FINANCE_CHAT_ID;}

        await sendMessageToChat(targetId, msg, type);
    } else {
        startBot();
    }
}
