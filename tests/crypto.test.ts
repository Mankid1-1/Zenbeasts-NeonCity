
import { describe, it, expect } from 'vitest';
import { generateSecureHex } from '../utils';
import { connectWalletService } from '../services/web3';

describe('Crypto Security', () => {
  it('generateSecureHex should produce a hex string of correct length', () => {
    const hex = generateSecureHex(10);
    expect(hex).toHaveLength(20); // 10 bytes = 20 hex chars
    expect(hex).toMatch(/^[0-9a-f]+$/);
  });

  it('generateSecureHex should produce unique values', () => {
    const hex1 = generateSecureHex(8);
    const hex2 = generateSecureHex(8);
    expect(hex1).not.toBe(hex2);
  });

  it('connectWalletService should return addresses generated securely', async () => {
    const wallet = await connectWalletService('ethereum');
    expect(wallet.address).toMatch(/^0x[0-9a-f]{40}$/);

    const solWallet = await connectWalletService('solana');
    // Verify Solana mock address format: 'Sol' + 8 hex chars
    expect(solWallet.address).toMatch(/^Sol[0-9a-f]{8}$/);
  });
});
