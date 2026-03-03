#!/usr/bin/env node
/**
 * Telegram Notifier Bot
 * Sends notifications to configured Telegram channels
 * 
 * Security: All secrets via environment variables
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

/**
 * Send message to a specific channel
 * @param {string} chatId - Telegram chat ID
 * @param {string} message - Message to send
 * @param {string} type - Message type (info/warn/error/task)
 */
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

/**
 * Send task notification to Manager
 */
export function notifyManager(message) {
    return sendMessageToChat(MANAGER_CHAT_ID, message, 'task');
}

/**
 * Send warning to Auditor
 */
export function notifyAuditor(message) {
    return sendMessageToChat(AUDITOR_CHAT_ID, message, 'warn');
}

/**
 * Send status update to Finance
 */
export function notifyFinance(message) {
    return sendMessageToChat(FINANCE_CHAT_ID, message, 'info');
}

/**
 * Send generic message to any chat ID
 */
export function notifyChat(chatId, message, type = 'info') {
    return sendMessageToChat(chatId, message, type);
}

/**
 * Start bot in polling mode (for inbound commands if needed)
 */
export function startBot() {
    bot.launch();
    console.log('🤖 Telegram bot started (polling mode)');
    
    // Graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        notifyManager,
        notifyAuditor,
        notifyFinance,
        notifyChat,
        startBot
    };
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    startBot();
}
