
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
    });
});
