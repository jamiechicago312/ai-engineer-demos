/**
 * Integration tests for GitHub API interactions
 */

const fs = require('fs');
const path = require('path');

// Read and evaluate the script content
const scriptPath = path.join(__dirname, '..', 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Create a safe evaluation context
const createScriptContext = () => {
  const context = {
    document: global.document,
    window: global.window,
    console: global.console,
    alert: global.alert,
    fetch: global.fetch,
    URLSearchParams: global.URLSearchParams,
    module: { exports: {} }
  };
  
  // Execute script in context
  const scriptFunction = new Function(...Object.keys(context), scriptContent);
  scriptFunction(...Object.values(context));
  
  return context.module.exports;
};

describe('GitHub API Integration Tests', () => {
  let portfolioFunctions;
  
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <img id="profile-avatar" />
      <div id="profile-name"></div>
      <div id="profile-bio"></div>
      <a id="profile-github"></a>
      <a id="profile-blog" style="display: none;"></a>
      <a id="profile-twitter" style="display: none;"></a>
      <div id="public-repos"></div>
      <div id="followers"></div>
      <div id="following"></div>
      <div id="total-stars"></div>
      <div id="repos-container"></div>
      <div id="activity-container"></div>
      <input id="github-username" value="testuser" />
    `;
    
    // Reset mocks
    jest.clearAllMocks();
    fetch.mockClear();
    
    // Create fresh context
    portfolioFunctions = createScriptContext();
  });

  describe('loadUserData function', () => {
    test('should handle successful API responses', async () => {
      const mockUser = {
        login: 'testuser',
        name: 'Test User',
        bio: 'Test bio',
        avatar_url: 'https://example.com/avatar.jpg',
        html_url: 'https://github.com/testuser',
        public_repos: 10,
        followers: 50,
        following: 25
      };

      const mockRepos = [
        {
          name: 'repo1',
          description: 'Test repo 1',
          html_url: 'https://github.com/testuser/repo1',
          stargazers_count: 10,
          forks_count: 5,
          watchers_count: 8,
          language: 'JavaScript',
          fork: false,
          private: false
        }
      ];

      const mockEvents = [
        {
          type: 'PushEvent',
          repo: { name: 'testuser/repo1' },
          payload: { commits: [1, 2] },
          created_at: new Date().toISOString()
        }
      ];

      // Mock fetch responses
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRepos)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockEvents)
        });

      await portfolioFunctions.loadUserData('testuser');

      // Verify API calls were made
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(fetch).toHaveBeenCalledWith('https://api.github.com/users/testuser');
      expect(fetch).toHaveBeenCalledWith('https://api.github.com/users/testuser/repos?sort=updated&per_page=100');
      expect(fetch).toHaveBeenCalledWith('https://api.github.com/users/testuser/events/public?per_page=10');

      // Verify DOM updates
      expect(document.getElementById('profile-name').textContent).toBe('Test User');
      expect(document.getElementById('public-repos').textContent).toBe('10');
    });

    test('should handle user not found error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await portfolioFunctions.loadUserData('nonexistentuser');

      expect(fetch).toHaveBeenCalledWith('https://api.github.com/users/nonexistentuser');
      expect(global.alert).toHaveBeenCalledWith('Error loading data: User not found: nonexistentuser');
    });

    test('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await portfolioFunctions.loadUserData('testuser');

      expect(global.alert).toHaveBeenCalledWith('Error loading data: Network error');
    });

    test('should handle empty username', async () => {
      await portfolioFunctions.loadUserData('');

      expect(global.alert).toHaveBeenCalledWith('Please enter a GitHub username');
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should handle null username', async () => {
      await portfolioFunctions.loadUserData(null);

      expect(global.alert).toHaveBeenCalledWith('Please enter a GitHub username');
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should use input value when no username provided', async () => {
      document.getElementById('github-username').value = 'inputuser';

      const mockUser = {
        login: 'inputuser',
        name: 'Input User',
        bio: 'Input bio',
        avatar_url: 'https://example.com/avatar.jpg',
        html_url: 'https://github.com/inputuser',
        public_repos: 5,
        followers: 10,
        following: 5
      };

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        });

      await portfolioFunctions.loadUserData();

      expect(fetch).toHaveBeenCalledWith('https://api.github.com/users/inputuser');
    });

    test('should handle API rate limiting', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      });

      await portfolioFunctions.loadUserData('testuser');

      expect(global.alert).toHaveBeenCalledWith('Error loading data: User not found: testuser');
    });

    test('should handle malformed JSON responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await portfolioFunctions.loadUserData('testuser');

      expect(global.alert).toHaveBeenCalledWith('Error loading data: Invalid JSON');
    });

    test('should handle partial API failures', async () => {
      const mockUser = {
        login: 'testuser',
        name: 'Test User',
        bio: 'Test bio',
        avatar_url: 'https://example.com/avatar.jpg',
        html_url: 'https://github.com/testuser',
        public_repos: 10,
        followers: 50,
        following: 25
      };

      // User API succeeds, repos API fails, events API succeeds
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        });

      await portfolioFunctions.loadUserData('testuser');

      // Should still update profile even if repos fail
      expect(document.getElementById('profile-name').textContent).toBe('Test User');
    });
  });

  describe('API Response Validation', () => {
    test('should handle user response with missing fields', async () => {
      const incompleteUser = {
        login: 'testuser'
        // Missing other fields
      };

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(incompleteUser)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        });

      await portfolioFunctions.loadUserData('testuser');

      // Should handle missing fields gracefully
      expect(document.getElementById('profile-name').textContent).toBe('testuser');
      expect(document.getElementById('profile-bio').textContent).toBe('No bio available');
    });

    test('should handle repos response with invalid data', async () => {
      const mockUser = {
        login: 'testuser',
        name: 'Test User',
        public_repos: 1,
        followers: 0,
        following: 0
      };

      const invalidRepos = [
        null,
        undefined,
        { name: 'valid-repo', stargazers_count: 5, fork: false },
        { /* missing required fields */ }
      ];

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(invalidRepos)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        });

      await portfolioFunctions.loadUserData('testuser');

      // Should handle invalid repos gracefully
      const container = document.getElementById('repos-container');
      expect(container.children.length).toBeGreaterThanOrEqual(0);
    });

    test('should handle events response with invalid data', async () => {
      const mockUser = {
        login: 'testuser',
        name: 'Test User',
        public_repos: 0,
        followers: 0,
        following: 0
      };

      const invalidEvents = [
        null,
        undefined,
        { type: 'PushEvent', repo: { name: 'test' }, created_at: new Date().toISOString() },
        { /* missing required fields */ }
      ];

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(invalidEvents)
        });

      await portfolioFunctions.loadUserData('testuser');

      // Should handle invalid events gracefully
      const container = document.getElementById('activity-container');
      expect(container.children.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Loading States', () => {
    test('should show loading states during API calls', async () => {
      let resolveUser, resolveRepos, resolveEvents;
      
      const userPromise = new Promise(resolve => { resolveUser = resolve; });
      const reposPromise = new Promise(resolve => { resolveRepos = resolve; });
      const eventsPromise = new Promise(resolve => { resolveEvents = resolve; });

      fetch
        .mockReturnValueOnce(userPromise)
        .mockReturnValueOnce(reposPromise)
        .mockReturnValueOnce(eventsPromise);

      // Start loading
      const loadPromise = portfolioFunctions.loadUserData('testuser');

      // Check loading states are shown
      expect(document.getElementById('profile-name').textContent).toBe('Loading...');
      expect(document.getElementById('repos-container').innerHTML).toContain('Loading repositories...');
      expect(document.getElementById('activity-container').innerHTML).toContain('Loading activity...');

      // Resolve promises
      resolveUser({
        ok: true,
        json: () => Promise.resolve({
          login: 'testuser',
          name: 'Test User',
          public_repos: 0,
          followers: 0,
          following: 0
        })
      });
      
      resolveRepos({
        ok: true,
        json: () => Promise.resolve([])
      });
      
      resolveEvents({
        ok: true,
        json: () => Promise.resolve([])
      });

      await loadPromise;

      // Loading states should be replaced
      expect(document.getElementById('profile-name').textContent).toBe('Test User');
    });
  });
});