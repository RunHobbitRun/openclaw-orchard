#!/usr/bin/env node
/**
 * Solana Wallet Aging Script
 * Performs small random swaps to create organic wallet activity
 */

import {
    Keypair,
    clusterApiUrl
} from '@solana/web3.js';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import bs58 from 'bs58';
import path from 'path';

const PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY;
const workspace = process.env.OPENCLAW_WORKSPACE || path.join(process.env.HOME, '.openclaw');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

function loadPrivateKey() {
    if (PRIVATE_KEY) {
        const trimmed = PRIVATE_KEY.trim();
        try {
            if (trimmed.startsWith('[')) {
                return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(trimmed)));
            }
            return Keypair.fromSecretKey(Uint8Array.from(bs58.decode(trimmed)));
        } catch {
            console.error('❌ Invalid SOLANA_PRIVATE_KEY format.');
            process.exit(1);
        }
    }

    const possiblePaths = [
        path.join(process.env.HOME, '.config/solana/id.json'),
        path.join(workspace, 'wallet.json')
    ];

    for (const p of possiblePaths) {
        if (existsSync(p)) {
            try {
                return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(p, 'utf8'))));
            } catch { }
        }
    }

    console.error('❌ No private key found.');
    process.exit(1);
}

async function logToSupabase(action, details) {
    if (!supabaseKey || !supabaseUrl) { return; }

    try {
        const logEntry = { action, details: JSON.stringify(details), timestamp: new Date().toISOString() };
        execSync(
            `curl -s -X POST "${supabaseUrl}/rest/v1/agent_actions" `
            + `-H "apikey: ${supabaseKey}" `
            + `-H "Content-Type: application/json" `
            + `-d '${JSON.stringify(logEntry)}'`
        );
    } catch { }
}

async function simulateWalletAging(wallet, iterations = 3) {
    console.log(`🔄 Starting wallet aging simulation (${iterations} iterations)`);
    for (let i = 0; i < iterations; i++) {
        const recipient = Keypair.generate().publicKey.toString();
        const amount = (Math.random() * 0.099 + 0.001).toFixed(3);

        console.log(`Iteration ${i + 1}/${iterations}: To ${recipient} | Amount: ${amount} SOL (SIMULATED)`);

        await logToSupabase('wallet_aging', { iteration: i + 1, to: recipient, amount: parseFloat(amount), simulated: true });
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 2000));
    }
}

const wallet = loadPrivateKey();
const iterations = parseInt(process.env.WALLET_AGING_ITERATIONS) || 3;
await simulateWalletAging(wallet, iterations);
