// Jest setup file for DOM testing
const { TextEncoder, TextDecoder } = require('util');

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch for API testing
global.fetch = jest.fn();

// Mock DOM methods that might not be available in jsdom
// Don't override location as jsdom handles it

// Mock URLSearchParams
global.URLSearchParams = class URLSearchParams {
  constructor(search = '') {
    this.params = new Map();
    if (search.startsWith('?')) {
      search = search.slice(1);
    }
    if (search) {
      search.split('&').forEach(param => {
        const [key, value] = param.split('=');
        this.params.set(key, decodeURIComponent(value || ''));
      });
    }
  }
  
  get(key) {
    return this.params.get(key);
  }
  
  set(key, value) {
    this.params.set(key, value);
  }
};

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Mock alert
global.alert = jest.fn();

// Setup DOM
document.body.innerHTML = `
  <div id="profile-avatar"></div>
  <div id="profile-name"></div>
  <div id="profile-bio"></div>
  <a id="profile-github"></a>
  <a id="profile-blog"></a>
  <a id="profile-twitter"></a>
  <div id="public-repos"></div>
  <div id="followers"></div>
  <div id="following"></div>
  <div id="total-stars"></div>
  <div id="repos-container"></div>
  <div id="activity-container"></div>
  <input id="github-username" value="testuser" />
`;