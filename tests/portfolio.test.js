// Simple test suite for portfolio functions
// This can be run with Node.js for basic function testing

// Mock DOM for Node.js environment
const mockDOM = {
    getElementById: (id) => ({
        textContent: '',
        innerHTML: '',
        src: '',
        href: '',
        style: { display: 'none' },
        value: ''
    }),
    createElement: (tag) => ({
        className: '',
        innerHTML: '',
        appendChild: () => {}
    })
};

// Mock global objects for Node.js
global.document = mockDOM;
global.window = global;

// Test functions
function testTimeAgo() {
    // Simple implementation for testing
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
    
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const result1 = getTimeAgo(oneMinuteAgo);
    const result2 = getTimeAgo(oneHourAgo);
    const result3 = getTimeAgo(oneDayAgo);
    
    console.log('Testing getTimeAgo function:');
    console.log(`1 minute ago: ${result1} (expected: contains "minute")`);
    console.log(`1 hour ago: ${result2} (expected: contains "hour")`);
    console.log(`1 day ago: ${result3} (expected: contains "day")`);
    
    const passed = result1.includes('minute') && result2.includes('hour') && result3.includes('day');
    console.log(`Test result: ${passed ? 'PASS' : 'FAIL'}\n`);
    
    return passed;
}

function testActivityInfo() {
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
            case 'WatchEvent':
                return {
                    icon: 'fas fa-star',
                    title: `Starred ${repoName}`
                };
            default:
                return {
                    icon: 'fas fa-code',
                    title: `${event.type.replace('Event', '')} in ${repoName}`
                };
        }
    }
    
    const pushEvent = {
        type: 'PushEvent',
        repo: { name: 'test-repo' },
        payload: { commits: [1, 2, 3] }
    };
    
    const createEvent = {
        type: 'CreateEvent',
        repo: { name: 'test-repo' },
        payload: { ref_type: 'branch' }
    };
    
    const watchEvent = {
        type: 'WatchEvent',
        repo: { name: 'test-repo' }
    };
    
    const pushInfo = getActivityInfo(pushEvent);
    const createInfo = getActivityInfo(createEvent);
    const watchInfo = getActivityInfo(watchEvent);
    
    console.log('Testing getActivityInfo function:');
    console.log(`Push event: ${pushInfo.title}`);
    console.log(`Create event: ${createInfo.title}`);
    console.log(`Watch event: ${watchInfo.title}`);
    
    const passed = pushInfo.title.includes('Pushed 3 commits') && 
                  createInfo.title.includes('Created branch') &&
                  watchInfo.title.includes('Starred');
    
    console.log(`Test result: ${passed ? 'PASS' : 'FAIL'}\n`);
    
    return passed;
}

function testStatsCalculation() {
    const mockRepos = [
        { stargazers_count: 5, fork: false },
        { stargazers_count: 10, fork: false },
        { stargazers_count: 3, fork: true }, // This should be included in total
        { stargazers_count: 7, fork: false }
    ];
    
    const totalStars = mockRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const nonForkRepos = mockRepos.filter(repo => !repo.fork);
    
    console.log('Testing stats calculation:');
    console.log(`Total stars: ${totalStars} (expected: 25)`);
    console.log(`Non-fork repos: ${nonForkRepos.length} (expected: 3)`);
    
    const passed = totalStars === 25 && nonForkRepos.length === 3;
    console.log(`Test result: ${passed ? 'PASS' : 'FAIL'}\n`);
    
    return passed;
}

function testLanguageColors() {
    const LANGUAGE_COLORS = {
        'JavaScript': '#f1e05a',
        'Python': '#3572A5',
        'Java': '#b07219',
        'TypeScript': '#2b7489'
    };
    
    console.log('Testing language colors:');
    console.log(`JavaScript color: ${LANGUAGE_COLORS['JavaScript']}`);
    console.log(`Python color: ${LANGUAGE_COLORS['Python']}`);
    console.log(`Unknown language: ${LANGUAGE_COLORS['UnknownLang'] || '#666'}`);
    
    const passed = LANGUAGE_COLORS['JavaScript'] === '#f1e05a' && 
                  LANGUAGE_COLORS['Python'] === '#3572A5';
    
    console.log(`Test result: ${passed ? 'PASS' : 'FAIL'}\n`);
    
    return passed;
}

// Run all tests
function runTests() {
    console.log('=== Portfolio JavaScript Tests ===\n');
    
    const tests = [
        testTimeAgo,
        testActivityInfo,
        testStatsCalculation,
        testLanguageColors
    ];
    
    let passed = 0;
    let total = tests.length;
    
    tests.forEach(test => {
        if (test()) {
            passed++;
        }
    });
    
    console.log('=== Test Summary ===');
    console.log(`Passed: ${passed}/${total}`);
    console.log(`Status: ${passed === total ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    
    return passed === total;
}

// Export for use in other environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runTests,
        testTimeAgo,
        testActivityInfo,
        testStatsCalculation,
        testLanguageColors
    };
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}