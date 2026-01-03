
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
    });
});

describe('Web3 Service Security', () => {
    it('connectWalletService generates valid looking addresses', async () => {
        const ethWallet = await connectWalletService('ethereum');
        expect(ethWallet.address).toMatch(/^0x[0-9a-f]{40}$/);

        const solWallet = await connectWalletService('solana');
        expect(solWallet.address).toMatch(/^Sol[a-zA-Z0-9]{40}$/);
    });
});
