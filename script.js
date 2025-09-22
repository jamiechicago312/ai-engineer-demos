// GitHub API Configuration
const GITHUB_API_BASE = 'https://api.github.com';

// Language colors for repository cards
const LANGUAGE_COLORS = {
    'JavaScript': '#f1e05a',
    'Python': '#3572A5',
    'Java': '#b07219',
    'TypeScript': '#2b7489',
    'C++': '#f34b7d',
    'C': '#555555',
    'C#': '#239120',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'Dart': '#00B4AB',
    'HTML': '#e34c26',
    'CSS': '#1572B6',
    'Shell': '#89e051',
    'Vue': '#2c3e50',
    'React': '#61dafb'
};

// Global variables
let currentUser = null;
let userRepos = [];

// Initialize the portfolio
document.addEventListener('DOMContentLoaded', function() {
    // Load default user or from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user') || 'jamiechicago312'; // Default to repo owner
    
    document.getElementById('github-username').value = username;
    loadUserData(username);
});

// Main function to load user data
async function loadUserData(username = null) {
    if (!username) {
        username = document.getElementById('github-username').value.trim();
    }
    
    if (!username) {
        alert('Please enter a GitHub username');
        return;
    }
    
    try {
        showLoading();
        
        // Fetch user profile
        const userResponse = await fetch(`${GITHUB_API_BASE}/users/${username}`);
        if (!userResponse.ok) {
            throw new Error(`User not found: ${username}`);
        }
        
        currentUser = await userResponse.json();
        
        // Fetch user repositories
        const reposResponse = await fetch(`${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=100`);
        userRepos = await reposResponse.json();
        
        // Fetch user events (activity)
        const eventsResponse = await fetch(`${GITHUB_API_BASE}/users/${username}/events/public?per_page=10`);
        const userEvents = await eventsResponse.json();
        
        // Update the portfolio
        updateProfile(currentUser);
        updateStats(currentUser, userRepos);
        updateRepositories(userRepos);
        updateActivity(userEvents);
        
        hideLoading();
        
    } catch (error) {
        console.error('Error loading user data:', error);
        alert(`Error loading data: ${error.message}`);
        hideLoading();
    }
}

// Update profile section
function updateProfile(user) {
    document.getElementById('profile-avatar').src = user.avatar_url;
    document.getElementById('profile-name').textContent = user.name || user.login;
    document.getElementById('profile-bio').textContent = user.bio || 'No bio available';
    
    // Update profile links
    const githubLink = document.getElementById('profile-github');
    githubLink.href = user.html_url;
    
    const blogLink = document.getElementById('profile-blog');
    if (user.blog) {
        blogLink.href = user.blog.startsWith('http') ? user.blog : `https://${user.blog}`;
        blogLink.style.display = 'inline-flex';
    } else {
        blogLink.style.display = 'none';
    }
    
    const twitterLink = document.getElementById('profile-twitter');
    if (user.twitter_username) {
        twitterLink.href = `https://twitter.com/${user.twitter_username}`;
        twitterLink.style.display = 'inline-flex';
    } else {
        twitterLink.style.display = 'none';
    }
}

// Update stats section
function updateStats(user, repos) {
    document.getElementById('public-repos').textContent = user.public_repos;
    document.getElementById('followers').textContent = user.followers;
    document.getElementById('following').textContent = user.following;
    
    // Calculate total stars
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    document.getElementById('total-stars').textContent = totalStars;
}

// Update repositories section
function updateRepositories(repos) {
    const container = document.getElementById('repos-container');
    container.innerHTML = '';
    
    // Sort repos by stars and take top 6
    const featuredRepos = repos
        .filter(repo => !repo.fork) // Exclude forks
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6);
    
    featuredRepos.forEach(repo => {
        const repoCard = createRepositoryCard(repo);
        container.appendChild(repoCard);
    });
    
    if (featuredRepos.length === 0) {
        container.innerHTML = '<p class="loading">No repositories found</p>';
    }
}

// Create repository card element
function createRepositoryCard(repo) {
    const card = document.createElement('div');
    card.className = 'repo-card';
    
    const languageColor = LANGUAGE_COLORS[repo.language] || '#666';
    
    card.innerHTML = `
        <div class="repo-header">
            <a href="${repo.html_url}" target="_blank" class="repo-name">${repo.name}</a>
            <span class="repo-visibility">${repo.private ? 'Private' : 'Public'}</span>
        </div>
        <p class="repo-description">${repo.description || 'No description available'}</p>
        <div class="repo-stats">
            ${repo.language ? `
                <span class="repo-stat">
                    <span class="language-dot" style="background-color: ${languageColor}"></span>
                    ${repo.language}
                </span>
            ` : ''}
            <span class="repo-stat">
                <i class="fas fa-star"></i>
                ${repo.stargazers_count}
            </span>
            <span class="repo-stat">
                <i class="fas fa-code-branch"></i>
                ${repo.forks_count}
            </span>
            <span class="repo-stat">
                <i class="fas fa-eye"></i>
                ${repo.watchers_count}
            </span>
        </div>
    `;
    
    return card;
}

// Update activity section
function updateActivity(events) {
    const container = document.getElementById('activity-container');
    container.innerHTML = '';
    
    if (!events || events.length === 0) {
        container.innerHTML = '<p class="loading">No recent activity found</p>';
        return;
    }
    
    events.slice(0, 10).forEach(event => {
        const activityItem = createActivityItem(event);
        container.appendChild(activityItem);
    });
}

// Create activity item element
function createActivityItem(event) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    const { icon, title } = getActivityInfo(event);
    const timeAgo = getTimeAgo(new Date(event.created_at));
    
    item.innerHTML = `
        <div class="activity-icon">
            <i class="${icon}"></i>
        </div>
        <div class="activity-content">
            <div class="activity-title">${title}</div>
            <div class="activity-time">${timeAgo}</div>
        </div>
    `;
    
    return item;
}

// Get activity information based on event type
function getActivityInfo(event) {
    const repoName = event.repo ? event.repo.name : 'Unknown';
    
    switch (event.type) {
        case 'PushEvent':
            const commitCount = event.payload.commits ? event.payload.commits.length : 1;
            return {
                icon: 'fas fa-code-commit',
                title: `Pushed ${commitCount} commit${commitCount > 1 ? 's' : ''} to ${repoName}`
            };
        case 'CreateEvent':
            return {
                icon: 'fas fa-plus',
                title: `Created ${event.payload.ref_type} in ${repoName}`
            };
        case 'DeleteEvent':
            return {
                icon: 'fas fa-trash',
                title: `Deleted ${event.payload.ref_type} in ${repoName}`
            };
        case 'ForkEvent':
            return {
                icon: 'fas fa-code-branch',
                title: `Forked ${repoName}`
            };
        case 'WatchEvent':
            return {
                icon: 'fas fa-star',
                title: `Starred ${repoName}`
            };
        case 'IssuesEvent':
            return {
                icon: 'fas fa-exclamation-circle',
                title: `${event.payload.action} issue in ${repoName}`
            };
        case 'PullRequestEvent':
            return {
                icon: 'fas fa-code-pull-request',
                title: `${event.payload.action} pull request in ${repoName}`
            };
        case 'ReleaseEvent':
            return {
                icon: 'fas fa-tag',
                title: `Released ${event.payload.release.tag_name} in ${repoName}`
            };
        default:
            return {
                icon: 'fas fa-code',
                title: `${event.type.replace('Event', '')} in ${repoName}`
            };
    }
}

// Calculate time ago
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    }
}

// Show loading state
function showLoading() {
    const sections = ['profile-name', 'profile-bio', 'public-repos', 'followers', 'following', 'total-stars'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = 'Loading...';
        }
    });
    
    document.getElementById('repos-container').innerHTML = '<div class="loading">Loading repositories...</div>';
    document.getElementById('activity-container').innerHTML = '<div class="loading">Loading activity...</div>';
}

// Hide loading state
function hideLoading() {
    // Loading states are replaced by actual content in update functions
}

// Handle Enter key in username input
document.getElementById('github-username').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        loadUserData();
    }
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadUserData,
        updateProfile,
        updateStats,
        updateRepositories,
        updateActivity,
        getActivityInfo,
        getTimeAgo,
        createRepositoryCard,
        createActivityItem
    };
}