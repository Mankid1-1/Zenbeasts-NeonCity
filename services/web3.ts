
import { Chain, Wallet } from '../types';
import { TOKENOMICS } from '../constants';

// --- ZEN CHAIN SIMULATION ---
// This service simulates a blockchain connection by persisting a "Wallet" state
// to localStorage. This allows "ZEN" (Hard Currency) to be preserved across reloads,
// acting as a real local testnet wallet.

const WALLET_STORAGE_KEY = 'zen_wallet_ledger';

interface LocalLedger {
    [address: string]: {
        balance: number;
        nonce: number;
    }
}

// Helper to get/set ledger
const getLedger = (): LocalLedger => {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(WALLET_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
};

const updateLedger = (address: string, balanceChange: number) => {
    if (typeof window === 'undefined') return;
    const ledger = getLedger();
    if (!ledger[address]) {
        ledger[address] = { balance: 0, nonce: 0 };
    }
    ledger[address].balance += balanceChange;
    ledger[address].nonce += 1;
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(ledger));
    return ledger[address].balance;
};

// Simulated latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const connectWalletService = async (chain: Chain): Promise<Wallet> => {
    await delay(800); // Simulate connection handshake

    // Check if we already have a stored address for this session/browser
    let storedAddress = localStorage.getItem('zen_active_address');

    if (!storedAddress) {
        // Generate new address if none exists
        storedAddress = chain === 'solana'
            ? 'Sol' + Math.random().toString(36).substring(2, 10)
            : '0x' + Math.random().toString(36).substring(2, 40);
        localStorage.setItem('zen_active_address', storedAddress);
    }
    
    // Get balance from ledger
    const ledger = getLedger();
    const balance = ledger[storedAddress]?.balance || 0;

    // Initialize if new
    if (ledger[storedAddress] === undefined) {
        updateLedger(storedAddress, 0);
    }

    return {
        address: storedAddress,
        chain,
        zenBalance: balance, // Starts with 0 ZEN or persisted amount
        isConnected: true
    };
};

export const estimateGas = (chain: Chain): number => {
    return TOKENOMICS.GAS_FEES[chain];
};

export const simulateTransaction = async (chain: Chain, type: 'mint' | 'transfer' | 'approve'): Promise<boolean> => {
    const latency = chain === 'solana' ? 1000 : 3000;
    await delay(latency);

    // 98% success rate (improved for "Own Engine" reliability)
    if (Math.random() > 0.98) throw new Error("Network Congestion: Transaction Failed");
    return true;
};

export const bridgeOffChainToOnChain = async (amountZC: number, chain: Chain): Promise<number> => {
    // Bridges Soft Currency (ZC) to Hard Currency (ZEN)
    await delay(2000);
    const zenAmount = amountZC * TOKENOMICS.SWAP_RATE;
    const gas = TOKENOMICS.GAS_FEES[chain];

    const finalAmount = zenAmount - gas;
    if (finalAmount <= 0) throw new Error("Amount too low to cover gas fees.");

    // Update Local Ledger
    const address = localStorage.getItem('zen_active_address');
    if (address) {
        updateLedger(address, finalAmount);
    }

    return finalAmount;
};

// New function to spend ZEN (e.g. buying from market)
export const spendZen = async (amount: number): Promise<void> => {
     await delay(1000);
     const address = localStorage.getItem('zen_active_address');
     if (!address) throw new Error("No wallet connected");

     const ledger = getLedger();
     const current = ledger[address]?.balance || 0;

     if (current < amount) throw new Error("Insufficient ZEN Balance on Chain.");

     updateLedger(address, -amount);
};
