# AI Builders Discussion Thread Creator

This toolkit creates GitHub Discussion threads in the [AI Builders community](https://github.com/AI-Product-Development/aibuilders/discussions) from markdown files in the [wiki challenges directory](https://github.com/AI-Product-Development/wiki/tree/main/challenges).

## 🚀 Quick Start

### Prerequisites

1. **Install GitHub CLI**:
   ```bash
   winget install --id GitHub.cli
   ```

2. **Authenticate with GitHub**:
   ```bash
   gh auth login
   ```

3. **Ensure you have Node.js installed** (for the JavaScript version):
   - Download from [nodejs.org](https://nodejs.org/)

### Usage Options

#### Option 1: Node.js Script (Recommended for Windows)
```bash
node create-aibuilders-discussions.js
```

#### Option 2: Bash Script (Requires WSL or Git Bash)
```bash
# Make executable (if using WSL/Git Bash)
chmod +x create-aibuilders-discussions.sh
./create-aibuilders-discussions.sh
```

#### Option 3: Windows Batch Helper
```batch
run-script.bat
```

## 📁 What It Does

1. **Sources**: Pulls markdown files from `AI-Product-Development/wiki/challenges`
2. **Targets**: Creates discussions in `AI-Product-Development/aibuilders/discussions`
3. **Category**: Automatically uses the "Challenges or Collaborations" category
4. **Enhances**: Adds community participation guidelines to each challenge

## ✨ Features

- **🎯 Challenge Enhancement**: Adds community-focused formatting
- **📋 Category Detection**: Automatically finds the right discussion category
- **🔄 Rate Limiting**: Respects GitHub API limits with delays
- **📊 Progress Tracking**: Shows detailed progress and results
- **🧹 Cleanup**: Handles temporary files automatically
- **📁 Results Logging**: Saves all created discussion URLs

## 📊 Output Files

After running, you'll get:
- `created-discussions.txt` - List of all created discussion URLs
- `aibuilders-discussions-results.json` - Detailed results with metadata
- `temp_wiki/` - Temporary clone (automatically cleaned up)

## 🎯 Example Enhancement

Original markdown becomes:
```markdown
🎯 Challenge: Build an AI-Powered Code Reviewer

[Original content...]

---

## 🤝 How to Participate
1. 💬 Comment below with your approach or questions
2. 🔗 Share your progress - link to your repo, demo, or writeup
3. 🏷️ Tag others who might be interested in collaborating
4. ⭐ Star this discussion to follow updates

## 📚 Resources
- 📖 Source Wiki: AI-Product-Development/wiki/challenges
- 🏠 Community Home: AI Builders
- 💡 More Challenges: Browse other discussions in this category
```

## 🔧 Troubleshooting

### Common Issues

1. **GitHub CLI not authenticated**:
   ```bash
   gh auth status
   gh auth login
   ```

2. **Permission denied**:
   - Ensure you have write access to the aibuilders repository

3. **Node.js not found**:
   - Install Node.js from [nodejs.org](https://nodejs.org/)

4. **Bash script won't run**:
   - Use Git Bash, WSL, or the Node.js version instead

### Windows-Specific Notes

- The Node.js script (`create-aibuilders-discussions.js`) works best on Windows
- The bash script requires WSL, Git Bash, or similar Unix environment
- Use the batch helper file for one-click execution

## 🤝 Support

If you encounter issues:
1. Check the prerequisites are installed
2. Verify GitHub CLI authentication
3. Ensure repository permissions
4. Check the generated log files for detailed error messages

## 📈 Next Steps After Running

1. Visit [AI Builders Discussions](https://github.com/AI-Product-Development/aibuilders/discussions)
2. Pin important challenges
3. Engage with the community!
4. Monitor the `created-discussions.txt` file for all URLs

Happy building! 🚀