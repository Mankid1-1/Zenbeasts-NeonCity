
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

    it('produces secure hex for ETH address simulation', () => {
        const ethAddrPart = generateSecureHex(40);
        expect(ethAddrPart.length).toBe(40);
        expect(/^[0-9a-f]{40}$/.test(ethAddrPart)).toBe(true);
    });
});
