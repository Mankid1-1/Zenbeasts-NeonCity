
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
    });
});

describe('Web3 Service Security', () => {
    it('connectWalletService generates valid looking addresses', async () => {
        const ethWallet = await connectWalletService('ethereum');
        expect(ethWallet.address).toMatch(/^0x[0-9a-f]{40}$/);

        const solWallet = await connectWalletService('solana');
        expect(solWallet.address).toMatch(/^Sol[a-zA-Z0-9]{8}$/);
    });
});
