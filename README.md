# AI Builders Community Landing Page

A modern, responsive landing page for the [AI Builders Community GitHub Discussions](https://github.com/AI-Product-Development/aibuilders/discussions).

## 🌐 Live Site

**[https://rsham004.github.io/aibuilders-landing/](https://rsham004.github.io/aibuilders-landing/)**

## ✨ Features

- **📊 Live Discussion Feed** - Displays all community discussions with real-time data
- **🕒 Recent Activity** - Shows the latest discussion updates and new posts
- **🔍 Search & Filter** - Find discussions by title, content, or category
- **📱 Responsive Design** - Works perfectly on desktop and mobile devices
- **⚡ Auto-Updates** - GitHub Actions fetch new discussions every 30 minutes
- **🎨 Modern UI** - Clean, GitHub-style interface with smooth animations

## 🏗️ Built With

- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with flexbox and grid layouts  
- **Vanilla JavaScript** - No frameworks, lightweight and fast
- **GitHub API** - Integration with GitHub Discussions API
- **GitHub Pages** - Static site hosting

## 📦 Project Structure

```
├── index.html              # Main landing page
├── fetch-discussions.js   # Fetches discussion data from GitHub
├── aibuilders-discussions-results.json  # Discussion data cache
└── .github/workflows/      # GitHub Actions for auto-updates
```

## 🚀 Auto-Updates

The site automatically updates via GitHub Actions:

- **Scheduled**: Runs every 30 minutes to fetch new discussions
- **Manual**: Trigger updates on-demand via GitHub Actions

```bash
# Manually trigger an update
gh workflow run manual-update.yml --repo rsham004/aibuilders-landing

# Check workflow status
gh run list --repo rsham004/aibuilders-landing
```

## 🔧 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/rsham004/aibuilders-landing.git
   cd aibuilders-landing
   ```

2. Open `index.html` in your browser or serve with a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

3. Visit `http://localhost:8000`

## 📊 Data Sources

- **Discussion Feed**: Loads from `aibuilders-discussions-results.json`
- **Auto-Refresh**: GitHub Actions update data every 30 minutes
- **Statistics**: Calculated dynamically from discussion data
- **Cache-Busting**: Multiple mechanisms prevent stale content

## 🤝 Contributing

This landing page is part of the AI Builders Community project. To contribute:

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Related Projects

- **[AI Builders Community](https://github.com/AI-Product-Development/aibuilders)** - Main community repository
- **[Community Wiki](https://github.com/AI-Product-Development/wiki)** - Challenge and resource documentation

## 📄 License

MIT License - see the main [AI Builders Community](https://github.com/AI-Product-Development/aibuilders) for details.

---

*Built with ❤️ for the AI Builders Community*