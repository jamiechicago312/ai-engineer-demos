# Developer Portfolio

A simple, responsive portfolio website that showcases GitHub repositories and activity using real-time public stats from the GitHub API.

## Features

- **Real-time GitHub Stats**: Displays public repositories, followers, following, and total stars
- **Featured Repositories**: Shows top repositories sorted by stars with language indicators
- **Recent Activity**: Displays recent GitHub activity including commits, stars, forks, and more
- **Responsive Design**: Mobile-friendly layout that works on all devices
- **GitHub Pages Ready**: Configured for easy deployment to GitHub Pages
- **Customizable**: Easy to configure for any GitHub user

## Demo

Visit the live demo: [https://jamiechicago312.github.io/ai-engineer-demos/](https://jamiechicago312.github.io/ai-engineer-demos/)

## Usage

### Quick Start

1. Clone this repository
2. Open `index.html` in your browser
3. Enter a GitHub username in the configuration section
4. Click "Load Portfolio" to see the portfolio in action

### Deploy to GitHub Pages

1. Fork this repository
2. Go to your repository settings
3. Navigate to "Pages" section
4. Select "GitHub Actions" as the source
5. The site will be automatically deployed when you push changes

### Customize for Your Profile

To set a default username, edit the `script.js` file and change the default username:

```javascript
const username = urlParams.get('user') || 'your-github-username';
```

You can also pass a username via URL parameter:
```
https://your-username.github.io/ai-engineer-demos/?user=github-username
```

## File Structure

```
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript for GitHub API integration
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions workflow for deployment
└── README.md           # This file
```

## Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with flexbox and grid
- **JavaScript (ES6+)**: GitHub API integration and DOM manipulation
- **GitHub API**: Real-time data fetching
- **Font Awesome**: Icons for better visual appeal
- **GitHub Actions**: Automated deployment to GitHub Pages

## API Rate Limits

This portfolio uses the GitHub API without authentication, which has a rate limit of 60 requests per hour per IP address. For higher rate limits, you can:

1. Add a GitHub personal access token (for development)
2. Implement caching to reduce API calls
3. Use GitHub GraphQL API for more efficient queries

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.