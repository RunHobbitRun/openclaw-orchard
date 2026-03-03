#!/usr/bin/env node
/**
 * Solana Wallet Aging Script
 * Performs small random swaps to create organic wallet activity
 * 
 * Security: Private key via environment variable (never hardcoded)
 * Logging: All actions logged to Supabase agent_actions table
 */

import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    clusterApiUrl
} from '@solana/web3.js';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY;
const supabaseUrl = process.env.SUPABASE_URL || 'https://api.supabase.com/project/<ref>';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Testnet for aging (safer, no real funds)
const connection = new Connection(clusterApiUrl('testnet'), 'confirmed');

/**
 * Load private key from environment or file
 */
function loadPrivateKey() {
    if (PRIVATE_KEY) {
        const secret = Uint8Array.from(JSON.parse(PRIVATE_KEY));
        return Keypair.fromSecretKey(secret);
    }
    
    // Fallback: try to load from ~/.config/solana/id.json (standard Solana config)
    try {
        const keyData = JSON.parse(readFileSync(`${process.env.HOME}/.config/solana/id.json`, 'utf8'));
        return Keypair.fromSecretKey(Uint8Array.from(keyData));
    } catch (e) {
        console.error('❌ No private key found. Set SOLANA_PRIVATE_KEY env var or use standard Solana config.');
        process.exit(1);
    }
}

/**
 * Log action to Supabase agent_actions table
 */
async function logToSupabase(action, details) {
    if (!supabaseKey || supabaseUrl.includes('<ref>')) {
        console.warn('⚠️ Supabase not configured. Skipping agent_actions log.');
        return { success: false, reason: 'Supabase not configured' };
    }

    try {
        // Using curl to insert into Supabase (no supabase-js dependency needed)
        const logEntry = {
            action,
            details: JSON.stringify(details),
            timestamp: new Date().toISOString()
        };

        const response = execSync(
            `curl -X POST "${supabaseUrl}/rest/v1/agent_actions" `
            + `-H "apikey: ${supabaseKey}" `
            + `-H "Content-Type: application/json" `
            + `-d '${JSON.stringify(logEntry)}'`,
            { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
        );

        console.log('✅ Logged to Supabase:', response.trim());
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to log to Supabase:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Generate random amount (0.001 - 0.1 SOL)
 */
function getRandomAmount() {
    return (Math.random() * 0.099 + 0.001).toFixed(3);
}

/**
 * Generate wallet aging transaction
 * Note: This is a simulation script - real aging requires interacting with DEXes
 * For now, we do small SOL transfers to create activity
 */
async function createAgingTransaction(wallet, recipient) {
    const amount = getRandomAmount();
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: new PublicKey(recipient),
            lamports: parseFloat(amount) * LAMPORTS_PER_SOL
        })
    );

    return { transaction, amount, recipient };
}

/**
 * Simulate wallet aging (testnet only - no real SOL moved)
 */
async function simulateWalletAging(wallet, iterations = 3) {
    console.log(`🔄 Starting wallet aging simulation (${iterations} iterations)`);
    
    for (let i = 0; i < iterations; i++) {
        const randomRecipient = Keypair.generate().publicKey.toString();
        const { transaction, amount, recipient } = await createAgingTransaction(wallet, randomRecipient);
        
        console.log(`Iteration ${i + 1}/${iterations}:`);
        console.log(`  - From: ${wallet.publicKey.toString()}`);
        console.log(`  - To: ${recipient}`);
        console.log(`  - Amount: ${amount} SOL`);
        console.log(`  - Status: SIMULATED (testnet, no actual transaction)`);
        
        await logToSupabase('wallet_aging', {
            iteration: i + 1,
            to: recipient,
            amount: parseFloat(amount),
            simulated: true,
            timestamp: new Date().toISOString()
        });
        
        // Random delay between 5-30 seconds
        await new Promise(resolve => setTimeout(resolve, Math.random() * 25000 + 5000));
    }
    
    console.log('✅ Wallet aging simulation complete');
}

/**
 * Main function
 */
async function main() {
    console.log('🦊 Solana Wallet Aging Script');
    console.log('============================\n');
    
    // Load wallet
    const wallet = loadPrivateKey();
    console.log(`Wallet: ${wallet.publicKey.toString()}`);
    console.log(`Environment: ${connection.rpcProvider._rpcUrl.includes('testnet') ? 'TESTNET (safe)' : 'MAINNET (CAUTION!)'}\n`);
    
    // Default iterations from env or 3
    const iterations = parseInt(process.env.WALLET_AGING_ITERATIONS) || 3;
    
    // Run aging
    await simulateWalletAging(wallet, iterations);
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadPrivateKey, simulateWalletAging, logToSupabase };
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    await main();
}
