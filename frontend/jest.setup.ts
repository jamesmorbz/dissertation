// Add custom jest matchers from jest-dom
import '@testing-library/jest-dom';

// Import jest for mocking
import { jest } from '@jest/globals';

// Mock for IntersectionObserver which isn't available in jsdom
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })),
  });
}

// Mock for matchMedia which isn't available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// A simpler approach to mock fetch that avoids TypeScript errors
const mockFetch = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    ok: true,
    redirected: false,
    status: 200,
    statusText: 'OK',
    type: 'basic',
    url: 'https://example.com',
    clone: () => {
      return this;
    },
    headers: new Headers(),
    body: null,
    bodyUsed: false,
  });
});

// Use type assertion to tell TypeScript this is a valid implementation
global.fetch = mockFetch as unknown as typeof global.fetch;

// Clear all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
