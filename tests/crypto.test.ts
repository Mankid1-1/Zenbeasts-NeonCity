
import { describe, it, expect } from 'vitest';
import { generateSecureHex } from '../utils';
import { connectWalletService } from '../services/web3';

describe('Security: Randomness', () => {
    it('generateSecureHex should return a hex string of correct length', () => {
        // 20 bytes = 40 hex chars
        const hex = generateSecureHex(20);
        expect(hex).toMatch(/^[0-9a-f]{40}$/);
        expect(hex.length).toBe(40);

        // 16 bytes = 32 hex chars
        const hex2 = generateSecureHex(16);
        expect(hex2).toMatch(/^[0-9a-f]{32}$/);
        expect(hex2.length).toBe(32);
    });

    it('generateSecureHex should produce different values', () => {
 sentinel-secure-rng-12779786001031090508
import { describe, it, expect } from 'vitest';
import { generateSecureHex, generateSecureAlphaNumeric } from '../utils';

describe('Crypto Utilities', () => {
    it('generateSecureHex produces correct length string', () => {
        const hex = generateSecureHex(40);
        expect(hex.length).toBe(40);
        expect(/^[0-9a-f]+$/.test(hex)).toBe(true);
    });

    it('generateSecureAlphaNumeric produces correct length string', () => {
        const str = generateSecureAlphaNumeric(10);
        expect(str.length).toBe(10);
        expect(/^[a-zA-Z0-9]+$/.test(str)).toBe(true);
    });

    it('produces unique values', () => {
        const h1 = generateSecureHex(10);
        const h2 = generateSecureHex(10);
        expect(h1).not.toBe(h2);
    });

    it('connectWalletService should generate proper length addresses', async () => {
        // Mock connection delay to be 0 for test speed if possible,
        // but we can just await it since it is 1s.

        // This test will fail if we haven't updated web3.ts yet
        const evmWallet = await connectWalletService('ethereum');
        expect(evmWallet.address.startsWith('0x')).toBe(true);
        // 0x + 40 chars = 42 chars
        expect(evmWallet.address.length).toBe(42);

        const solWallet = await connectWalletService('solana');
        expect(solWallet.address.startsWith('Sol')).toBe(true);
        // Previous logic: 'Sol' + 8 chars (substring(2,10)) = 11 chars
        // We want to improve this, maybe to something longer.
        // Let's say we want at least 16 chars of randomness.
        expect(solWallet.address.length).toBeGreaterThan(15);
    it('produces secure hex for ETH address simulation', () => {
        const ethAddrPart = generateSecureHex(40);
        expect(ethAddrPart.length).toBe(40);
        expect(/^[0-9a-f]{40}$/.test(ethAddrPart)).toBe(true);

 sentinel-secure-random-fix-722868137078572014
import { describe, it, expect } from 'vitest';
import { generateSecureHex, generateSecureAlphaNumeric } from '../utils';
import { connectWalletService } from '../services/web3';

describe('Crypto Utilities', () => {
    it('generateSecureHex produces hex string of correct length', () => {
        const length = 40;
        const hex = generateSecureHex(length);
        expect(hex).toHaveLength(length);
        expect(hex).toMatch(/^[0-9a-f]+$/);
    });

    it('generateSecureAlphaNumeric produces alphanumeric string of correct length', () => {
        const length = 10;
        const str = generateSecureAlphaNumeric(length);
        expect(str).toHaveLength(length);
        expect(str).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('generateSecureHex produces different values', () => {
        const hex1 = generateSecureHex(16);
        const hex2 = generateSecureHex(16);
        expect(hex1).not.toBe(hex2);

import { describe, it, expect, vi } from 'vitest';
import { generateSecureHex, generateSecureAlphaNumeric } from '../utils';
import { connectWalletService } from '../services/web3';

// Mock crypto if not available (though it should be in Node/Vitest env)
if (!global.crypto) {
    Object.defineProperty(global, 'crypto', {
        value: {
            getRandomValues: (arr: Uint8Array) => {
                for (let i = 0; i < arr.length; i++) {
                    arr[i] = Math.floor(Math.random() * 256);
                }
                return arr;
            }
        }
    });
}

describe('Crypto Security Utils', () => {
    it('generateSecureHex should produce a string of correct length', () => {
        const length = 40;
        const result = generateSecureHex(length);
        expect(result).toHaveLength(length);
        expect(result).toMatch(/^[0-9a-f]+$/);
    });

    it('generateSecureHex should produce different results', () => {
        const res1 = generateSecureHex(10);
        const res2 = generateSecureHex(10);
        expect(res1).not.toEqual(res2);
    });

    it('generateSecureAlphaNumeric should produce string of correct length', () => {
        const length = 8;
        const result = generateSecureAlphaNumeric(length);
        expect(result).toHaveLength(length);
        expect(result).toMatch(/^[a-zA-Z0-9]+$/);
 ZenBeasts
    });
});

describe('Web3 Service Security', () => {
    it('connectWalletService generates valid looking addresses', async () => {
        const ethWallet = await connectWalletService('ethereum');
        expect(ethWallet.address).toMatch(/^0x[0-9a-f]{40}$/);

        const solWallet = await connectWalletService('solana');
        expect(solWallet.address).toMatch(/^Sol[a-zA-Z0-9]{8}$/);
    it('connectWalletService should generate secure-looking addresses for Ethereum', async () => {
        const wallet = await connectWalletService('ethereum');
        expect(wallet.address).toMatch(/^0x[0-9a-f]{40}$/);
    });

    it('connectWalletService should generate secure-looking addresses for Solana', async () => {
        const wallet = await connectWalletService('solana');
        // Expect 'Sol' + 8 alphanumeric chars
        expect(wallet.address).toMatch(/^Sol[a-zA-Z0-9]{8}$/);
 ZenBeasts
    });
});
