# AI Builders Community Landing Page

A modern, responsive landing page for the [AI Builders Community GitHub Discussions](https://github.com/AI-Product-Development/aibuilders/discussions).

## 🌐 Live Site

**[https://rsham004.github.io/aibuilders-landing/](https://rsham004.github.io/aibuilders-landing/)**

## ✨ Features

- **📊 Live Discussion Feed** - Displays all community discussions with real-time data
- **🕒 Recent Activity** - Shows the latest discussion updates and new posts
- **🔍 Search & Filter** - Find discussions by title, content, or category
- **📱 Responsive Design** - Works perfectly on desktop and mobile devices
- **⚡ Real-time Updates** - Auto-refreshes recent changes every 5 minutes
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
├── deploy.js              # Deployment automation script
├── aibuilders-discussions-results.json  # Discussion data cache
└── create-aibuilders-discussions.js     # Discussion creation tool
```

## 🚀 Deployment

The site is automatically deployed to GitHub Pages. To redeploy:

```bash
# Run the deployment script
node deploy.js

# Or manually push changes
git add .
git commit -m "Update landing page"
git push origin master
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
- **Recent Activity**: Fetches live data from GitHub Discussions API
- **Statistics**: Calculated dynamically from discussion data

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