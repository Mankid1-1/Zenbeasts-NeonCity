
import { render, screen, fireEvent } from '@testing-library/react';
import DebugConsole from '../components/DebugConsole';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('DebugConsole Security', () => {
  it('should redact sensitive commands in the logs', () => {
    // Mock handlers
    const onAddCoins = vi.fn();
    const onAddBeast = vi.fn();
    const onLevelUp = vi.fn();
    const onReset = vi.fn();

    render(
      <DebugConsole
        onAddCoins={onAddCoins}
        onAddBeast={onAddBeast}
        onLevelUp={onLevelUp}
        onReset={onReset}
      />
    );

    // Open the console (Cmd + ` is usually how it's done, but the code listens for '`')
    // We can directly simulate the state or just trigger the keydown event.
    fireEvent.keyDown(window, { key: '`' });

    // Find the input
    const input = screen.getByPlaceholderText('Enter command...');

    // Type a sensitive command
    const secretKey = 'my-super-secret-key-123';
    fireEvent.change(input, { target: { value: `set gemini ${secretKey}` } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Check if the secret is exposed in the logs
    // The logs are rendered as divs.
    const logs = screen.queryAllByText((content, element) => {
       // Check if the element contains the secret
       return element?.textContent?.includes(secretKey) ?? false;
    });

    // If secure, logs should be empty or not contain the secret
    expect(logs.length).toBe(0);

    // It should contain the redacted version
    const redactedLogs = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('set gemini [REDACTED]') ?? false;
    });
    expect(redactedLogs.length).toBeGreaterThan(0);
  });
});
