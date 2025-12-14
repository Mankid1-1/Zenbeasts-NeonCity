
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DebugConsole from '../components/DebugConsole';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('DebugConsole Security', () => {
  it('should redact sensitive API keys in logs when using set command', () => {
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

    // Open the console (simulate pressing ` key)
    fireEvent.keyDown(window, { key: '`' });

    // Find input and type command
    const input = screen.getByPlaceholderText('Enter command...');
    const sensitiveKey = 'sk-secret-12345';

    // Test Gemini key setting
    fireEvent.change(input, { target: { value: `set gemini ${sensitiveKey}` } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Check if the log contains the redacted version NOT the clear text
    // We expect to find "set gemini ***********" or similar, but definitely NOT the actual key
    const logs = screen.getAllByText((content, element) => {
        return element?.tagName.toLowerCase() === 'div' && content.includes('set gemini');
    });

    // There should be a log entry for the command execution
    expect(logs.length).toBeGreaterThan(0);

    // NONE of the logs should contain the sensitive key
    const leakedLogs = screen.queryByText((content) => content.includes(sensitiveKey));
    expect(leakedLogs).toBeNull();
  });
});
