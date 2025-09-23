/**
 * Comprehensive Jest test suite for portfolio functionality
 */

// Import the script content for testing
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

describe('Portfolio JavaScript Functions', () => {
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

  describe('getTimeAgo function', () => {
    test('should return "Just now" for recent timestamps', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
      
      const result = portfolioFunctions.getTimeAgo(recent);
      expect(result).toBe('Just now');
    });

    test('should return correct minute format', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      expect(portfolioFunctions.getTimeAgo(oneMinuteAgo)).toBe('1 minute ago');
      expect(portfolioFunctions.getTimeAgo(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    test('should return correct hour format', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      
      expect(portfolioFunctions.getTimeAgo(oneHourAgo)).toBe('1 hour ago');
      expect(portfolioFunctions.getTimeAgo(threeHoursAgo)).toBe('3 hours ago');
    });

    test('should return correct day format', () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      expect(portfolioFunctions.getTimeAgo(oneDayAgo)).toBe('1 day ago');
      expect(portfolioFunctions.getTimeAgo(threeDaysAgo)).toBe('3 days ago');
    });

    test('should return correct month format for old dates', () => {
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      expect(portfolioFunctions.getTimeAgo(oneMonthAgo)).toBe('1 month ago');
      expect(portfolioFunctions.getTimeAgo(threeMonthsAgo)).toBe('3 months ago');
    });
  });

  describe('getActivityInfo function', () => {
    test('should handle PushEvent correctly', () => {
      const pushEvent = {
        type: 'PushEvent',
        repo: { name: 'test-repo' },
        payload: { commits: [1, 2, 3] }
      };
      
      const result = portfolioFunctions.getActivityInfo(pushEvent);
      expect(result.icon).toBe('fas fa-code-commit');
      expect(result.title).toBe('Pushed 3 commits to test-repo');
    });

    test('should handle PushEvent with single commit', () => {
      const pushEvent = {
        type: 'PushEvent',
        repo: { name: 'test-repo' },
        payload: { commits: [1] }
      };
      
      const result = portfolioFunctions.getActivityInfo(pushEvent);
      expect(result.title).toBe('Pushed 1 commit to test-repo');
    });

    test('should handle PushEvent without commits array', () => {
      const pushEvent = {
        type: 'PushEvent',
        repo: { name: 'test-repo' },
        payload: {}
      };
      
      const result = portfolioFunctions.getActivityInfo(pushEvent);
      expect(result.title).toBe('Pushed 1 commit to test-repo');
    });

    test('should handle CreateEvent correctly', () => {
      const createEvent = {
        type: 'CreateEvent',
        repo: { name: 'test-repo' },
        payload: { ref_type: 'branch' }
      };
      
      const result = portfolioFunctions.getActivityInfo(createEvent);
      expect(result.icon).toBe('fas fa-plus');
      expect(result.title).toBe('Created branch in test-repo');
    });

    test('should handle DeleteEvent correctly', () => {
      const deleteEvent = {
        type: 'DeleteEvent',
        repo: { name: 'test-repo' },
        payload: { ref_type: 'tag' }
      };
      
      const result = portfolioFunctions.getActivityInfo(deleteEvent);
      expect(result.icon).toBe('fas fa-trash');
      expect(result.title).toBe('Deleted tag in test-repo');
    });

    test('should handle ForkEvent correctly', () => {
      const forkEvent = {
        type: 'ForkEvent',
        repo: { name: 'test-repo' }
      };
      
      const result = portfolioFunctions.getActivityInfo(forkEvent);
      expect(result.icon).toBe('fas fa-code-branch');
      expect(result.title).toBe('Forked test-repo');
    });

    test('should handle WatchEvent correctly', () => {
      const watchEvent = {
        type: 'WatchEvent',
        repo: { name: 'test-repo' }
      };
      
      const result = portfolioFunctions.getActivityInfo(watchEvent);
      expect(result.icon).toBe('fas fa-star');
      expect(result.title).toBe('Starred test-repo');
    });

    test('should handle IssuesEvent correctly', () => {
      const issuesEvent = {
        type: 'IssuesEvent',
        repo: { name: 'test-repo' },
        payload: { action: 'opened' }
      };
      
      const result = portfolioFunctions.getActivityInfo(issuesEvent);
      expect(result.icon).toBe('fas fa-exclamation-circle');
      expect(result.title).toBe('opened issue in test-repo');
    });

    test('should handle PullRequestEvent correctly', () => {
      const prEvent = {
        type: 'PullRequestEvent',
        repo: { name: 'test-repo' },
        payload: { action: 'opened' }
      };
      
      const result = portfolioFunctions.getActivityInfo(prEvent);
      expect(result.icon).toBe('fas fa-code-pull-request');
      expect(result.title).toBe('opened pull request in test-repo');
    });

    test('should handle ReleaseEvent correctly', () => {
      const releaseEvent = {
        type: 'ReleaseEvent',
        repo: { name: 'test-repo' },
        payload: { release: { tag_name: 'v1.0.0' } }
      };
      
      const result = portfolioFunctions.getActivityInfo(releaseEvent);
      expect(result.icon).toBe('fas fa-tag');
      expect(result.title).toBe('Released v1.0.0 in test-repo');
    });

    test('should handle unknown event types', () => {
      const unknownEvent = {
        type: 'UnknownEvent',
        repo: { name: 'test-repo' }
      };
      
      const result = portfolioFunctions.getActivityInfo(unknownEvent);
      expect(result.icon).toBe('fas fa-code');
      expect(result.title).toBe('Unknown in test-repo');
    });

    test('should handle events without repo', () => {
      const eventWithoutRepo = {
        type: 'PushEvent',
        payload: { commits: [1] }
      };
      
      const result = portfolioFunctions.getActivityInfo(eventWithoutRepo);
      expect(result.title).toBe('Pushed 1 commit to Unknown');
    });
  });

  describe('updateProfile function', () => {
    test('should update profile elements correctly', () => {
      const mockUser = {
        avatar_url: 'https://example.com/avatar.jpg',
        name: 'Test User',
        login: 'testuser',
        bio: 'Test bio description',
        html_url: 'https://github.com/testuser'
      };
      
      portfolioFunctions.updateProfile(mockUser);
      
      expect(document.getElementById('profile-avatar').src).toBe(mockUser.avatar_url);
      expect(document.getElementById('profile-name').textContent).toBe(mockUser.name);
      expect(document.getElementById('profile-bio').textContent).toBe(mockUser.bio);
      expect(document.getElementById('profile-github').href).toBe(mockUser.html_url);
    });

    test('should use login when name is not available', () => {
      const mockUser = {
        avatar_url: 'https://example.com/avatar.jpg',
        login: 'testuser',
        bio: 'Test bio',
        html_url: 'https://github.com/testuser'
      };
      
      portfolioFunctions.updateProfile(mockUser);
      
      expect(document.getElementById('profile-name').textContent).toBe(mockUser.login);
    });

    test('should show default bio when bio is not available', () => {
      const mockUser = {
        avatar_url: 'https://example.com/avatar.jpg',
        name: 'Test User',
        login: 'testuser',
        html_url: 'https://github.com/testuser'
      };
      
      portfolioFunctions.updateProfile(mockUser);
      
      expect(document.getElementById('profile-bio').textContent).toBe('No bio available');
    });

    test('should handle blog URL correctly', () => {
      const mockUserWithBlog = {
        avatar_url: 'https://example.com/avatar.jpg',
        name: 'Test User',
        login: 'testuser',
        bio: 'Test bio',
        html_url: 'https://github.com/testuser',
        blog: 'https://testblog.com'
      };
      
      portfolioFunctions.updateProfile(mockUserWithBlog);
      
      const blogLink = document.getElementById('profile-blog');
      expect(blogLink.href).toBe(mockUserWithBlog.blog);
      expect(blogLink.style.display).toBe('inline-flex');
    });

    test('should add https to blog URL if missing', () => {
      const mockUser = {
        avatar_url: 'https://example.com/avatar.jpg',
        name: 'Test User',
        login: 'testuser',
        bio: 'Test bio',
        html_url: 'https://github.com/testuser',
        blog: 'testblog.com'
      };
      
      portfolioFunctions.updateProfile(mockUser);
      
      const blogLink = document.getElementById('profile-blog');
      expect(blogLink.href).toBe('https://testblog.com');
    });

    test('should hide blog link when no blog is provided', () => {
      const mockUser = {
        avatar_url: 'https://example.com/avatar.jpg',
        name: 'Test User',
        login: 'testuser',
        bio: 'Test bio',
        html_url: 'https://github.com/testuser'
      };
      
      portfolioFunctions.updateProfile(mockUser);
      
      const blogLink = document.getElementById('profile-blog');
      expect(blogLink.style.display).toBe('none');
    });

    test('should handle Twitter username correctly', () => {
      const mockUser = {
        avatar_url: 'https://example.com/avatar.jpg',
        name: 'Test User',
        login: 'testuser',
        bio: 'Test bio',
        html_url: 'https://github.com/testuser',
        twitter_username: 'testuser'
      };
      
      portfolioFunctions.updateProfile(mockUser);
      
      const twitterLink = document.getElementById('profile-twitter');
      expect(twitterLink.href).toBe('https://twitter.com/testuser');
      expect(twitterLink.style.display).toBe('inline-flex');
    });

    test('should hide Twitter link when no username is provided', () => {
      const mockUser = {
        avatar_url: 'https://example.com/avatar.jpg',
        name: 'Test User',
        login: 'testuser',
        bio: 'Test bio',
        html_url: 'https://github.com/testuser'
      };
      
      portfolioFunctions.updateProfile(mockUser);
      
      const twitterLink = document.getElementById('profile-twitter');
      expect(twitterLink.style.display).toBe('none');
    });
  });

  describe('updateStats function', () => {
    test('should update stats correctly', () => {
      const mockUser = {
        public_repos: 15,
        followers: 100,
        following: 50
      };
      
      const mockRepos = [
        { stargazers_count: 10 },
        { stargazers_count: 5 },
        { stargazers_count: 3 }
      ];
      
      portfolioFunctions.updateStats(mockUser, mockRepos);
      
      expect(document.getElementById('public-repos').textContent).toBe('15');
      expect(document.getElementById('followers').textContent).toBe('100');
      expect(document.getElementById('following').textContent).toBe('50');
      expect(document.getElementById('total-stars').textContent).toBe('18');
    });

    test('should handle empty repos array', () => {
      const mockUser = {
        public_repos: 0,
        followers: 0,
        following: 0
      };
      
      portfolioFunctions.updateStats(mockUser, []);
      
      expect(document.getElementById('total-stars').textContent).toBe('0');
    });

    test('should calculate total stars correctly with zero stars', () => {
      const mockUser = {
        public_repos: 5,
        followers: 10,
        following: 5
      };
      
      const mockRepos = [
        { stargazers_count: 0 },
        { stargazers_count: 0 },
        { stargazers_count: 0 }
      ];
      
      portfolioFunctions.updateStats(mockUser, mockRepos);
      
      expect(document.getElementById('total-stars').textContent).toBe('0');
    });
  });

  describe('createRepositoryCard function', () => {
    test('should create repository card with all information', () => {
      const mockRepo = {
        name: 'test-repo',
        html_url: 'https://github.com/user/test-repo',
        description: 'A test repository',
        language: 'JavaScript',
        stargazers_count: 10,
        forks_count: 5,
        watchers_count: 8,
        private: false
      };
      
      const card = portfolioFunctions.createRepositoryCard(mockRepo);
      
      expect(card.className).toBe('repo-card');
      expect(card.innerHTML).toContain('test-repo');
      expect(card.innerHTML).toContain('A test repository');
      expect(card.innerHTML).toContain('JavaScript');
      expect(card.innerHTML).toContain('10');
      expect(card.innerHTML).toContain('5');
      expect(card.innerHTML).toContain('8');
      expect(card.innerHTML).toContain('Public');
    });

    test('should handle private repository', () => {
      const mockRepo = {
        name: 'private-repo',
        html_url: 'https://github.com/user/private-repo',
        description: 'A private repository',
        language: 'Python',
        stargazers_count: 0,
        forks_count: 0,
        watchers_count: 1,
        private: true
      };
      
      const card = portfolioFunctions.createRepositoryCard(mockRepo);
      
      expect(card.innerHTML).toContain('Private');
    });

    test('should handle repository without description', () => {
      const mockRepo = {
        name: 'no-desc-repo',
        html_url: 'https://github.com/user/no-desc-repo',
        language: 'Java',
        stargazers_count: 2,
        forks_count: 1,
        watchers_count: 3,
        private: false
      };
      
      const card = portfolioFunctions.createRepositoryCard(mockRepo);
      
      expect(card.innerHTML).toContain('No description available');
    });

    test('should handle repository without language', () => {
      const mockRepo = {
        name: 'no-lang-repo',
        html_url: 'https://github.com/user/no-lang-repo',
        description: 'Repository without language',
        stargazers_count: 1,
        forks_count: 0,
        watchers_count: 2,
        private: false
      };
      
      const card = portfolioFunctions.createRepositoryCard(mockRepo);
      
      // Should not contain language section when language is null/undefined
      expect(card.innerHTML).not.toContain('language-dot');
    });
  });

  describe('createActivityItem function', () => {
    test('should create activity item correctly', () => {
      const mockEvent = {
        type: 'PushEvent',
        repo: { name: 'test-repo' },
        payload: { commits: [1, 2] },
        created_at: new Date().toISOString()
      };
      
      const item = portfolioFunctions.createActivityItem(mockEvent);
      
      expect(item.className).toBe('activity-item');
      expect(item.innerHTML).toContain('fas fa-code-commit');
      expect(item.innerHTML).toContain('Pushed 2 commits to test-repo');
      expect(item.innerHTML).toContain('Just now');
    });

    test('should handle old activity correctly', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 2); // 2 days ago
      
      const mockEvent = {
        type: 'WatchEvent',
        repo: { name: 'old-repo' },
        created_at: oldDate.toISOString()
      };
      
      const item = portfolioFunctions.createActivityItem(mockEvent);
      
      expect(item.innerHTML).toContain('2 days ago');
    });
  });

  describe('updateRepositories function', () => {
    test('should filter out forks and sort by stars', () => {
      const mockRepos = [
        { name: 'repo1', stargazers_count: 5, fork: false },
        { name: 'repo2', stargazers_count: 10, fork: true }, // This should be filtered out
        { name: 'repo3', stargazers_count: 15, fork: false },
        { name: 'repo4', stargazers_count: 1, fork: false }
      ];
      
      portfolioFunctions.updateRepositories(mockRepos);
      
      const container = document.getElementById('repos-container');
      expect(container.children.length).toBe(3); // Only non-fork repos
      
      // Check if sorted by stars (highest first)
      const firstRepo = container.children[0];
      expect(firstRepo.innerHTML).toContain('repo3'); // 15 stars
    });

    test('should limit to 6 repositories', () => {
      const mockRepos = Array.from({ length: 10 }, (_, i) => ({
        name: `repo${i}`,
        stargazers_count: i,
        fork: false
      }));
      
      portfolioFunctions.updateRepositories(mockRepos);
      
      const container = document.getElementById('repos-container');
      expect(container.children.length).toBe(6);
    });

    test('should show message when no repositories found', () => {
      portfolioFunctions.updateRepositories([]);
      
      const container = document.getElementById('repos-container');
      expect(container.innerHTML).toContain('No repositories found');
    });

    test('should show message when only forks are available', () => {
      const mockRepos = [
        { name: 'fork1', stargazers_count: 5, fork: true },
        { name: 'fork2', stargazers_count: 10, fork: true }
      ];
      
      portfolioFunctions.updateRepositories(mockRepos);
      
      const container = document.getElementById('repos-container');
      expect(container.innerHTML).toContain('No repositories found');
    });
  });

  describe('updateActivity function', () => {
    test('should display activity items correctly', () => {
      const mockEvents = [
        {
          type: 'PushEvent',
          repo: { name: 'repo1' },
          payload: { commits: [1] },
          created_at: new Date().toISOString()
        },
        {
          type: 'WatchEvent',
          repo: { name: 'repo2' },
          created_at: new Date().toISOString()
        }
      ];
      
      portfolioFunctions.updateActivity(mockEvents);
      
      const container = document.getElementById('activity-container');
      expect(container.children.length).toBe(2);
    });

    test('should limit to 10 activity items', () => {
      const mockEvents = Array.from({ length: 15 }, (_, i) => ({
        type: 'PushEvent',
        repo: { name: `repo${i}` },
        payload: { commits: [1] },
        created_at: new Date().toISOString()
      }));
      
      portfolioFunctions.updateActivity(mockEvents);
      
      const container = document.getElementById('activity-container');
      expect(container.children.length).toBe(10);
    });

    test('should show message when no activity found', () => {
      portfolioFunctions.updateActivity([]);
      
      const container = document.getElementById('activity-container');
      expect(container.innerHTML).toContain('No recent activity found');
    });

    test('should handle null/undefined events', () => {
      portfolioFunctions.updateActivity(null);
      
      const container = document.getElementById('activity-container');
      expect(container.innerHTML).toContain('No recent activity found');
    });
  });
});

describe('Error Handling and Edge Cases', () => {
  let portfolioFunctions;
  
  beforeEach(() => {
    // Reset DOM and mocks
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
    
    jest.clearAllMocks();
    portfolioFunctions = createScriptContext();
  });

  test('should handle malformed date in getTimeAgo', () => {
    const invalidDate = new Date('invalid');
    const result = portfolioFunctions.getTimeAgo(invalidDate);
    
    // Should not throw an error and return a reasonable default
    expect(typeof result).toBe('string');
  });

  test('should handle missing DOM elements gracefully', () => {
    // Remove some DOM elements
    document.getElementById('profile-name').remove();
    
    const mockUser = {
      avatar_url: 'https://example.com/avatar.jpg',
      name: 'Test User',
      login: 'testuser',
      bio: 'Test bio',
      html_url: 'https://github.com/testuser'
    };
    
    // Should not throw an error
    expect(() => {
      portfolioFunctions.updateProfile(mockUser);
    }).not.toThrow();
  });

  test('should handle repos with missing properties', () => {
    const incompleteRepos = [
      { name: 'repo1' }, // Missing stargazers_count
      { stargazers_count: 5 }, // Missing name
      {} // Empty object
    ];
    
    expect(() => {
      portfolioFunctions.updateRepositories(incompleteRepos);
    }).not.toThrow();
  });

  test('should handle events with missing properties', () => {
    const incompleteEvents = [
      { type: 'PushEvent' }, // Missing repo
      { repo: { name: 'test' } }, // Missing type
      {} // Empty object
    ];
    
    expect(() => {
      portfolioFunctions.updateActivity(incompleteEvents);
    }).not.toThrow();
  });
});