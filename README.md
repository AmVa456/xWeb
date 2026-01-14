# xWeb - Developer Dashboard

A lightweight, modular developer dashboard with real-time monitoring capabilities. Built with minimal dependencies for maximum performance.

## 🚀 Features

- **📰 RSS Feed Reader** - Monitor multiple RSS feeds in real-time
- **💬 IRC Client** - Connect to IRC channels and monitor conversations
- **📱 Social Media Integration** - Aggregate social media feeds (extensible with API keys)
- **🔧 System Diagnostics** - Real-time system and process monitoring
- **📝 Code Editor** - Lightweight file editor with syntax highlighting
- **💻 Terminal Integration** - Execute commands directly from the dashboard
- **🎨 Customizable Dashboard** - Drag-and-drop widgets to personalize your layout
- **⚡ Minimal Dependencies** - Built for performance with Express and WebSocket only

## 📦 Installation

```bash
npm install
```

## 🏃 Quick Start

```bash
npm start
```

Then open your browser to `http://localhost:3000`

## 🔧 Configuration

The application runs on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## 📚 Widget Types

### RSS Feed Reader
- Displays latest articles from configured RSS feeds
- Auto-refreshes every 5 minutes
- Add/remove feeds dynamically

### IRC Client
- Connect to IRC servers
- Monitor multiple channels
- Real-time message updates

### Social Media
- Aggregates social media feeds
- Extensible with API credentials
- Sample data included for demonstration

### System Diagnostics
- CPU, memory, and disk usage
- System uptime and load averages
- Node.js process information

### Code Editor
- Read and edit files within the workspace
- Safe file operations with path validation
- Lightweight alternative to full IDEs

### Terminal
- Execute shell commands
- View command output in real-time
- WebSocket-based for instant feedback

## 🎨 Customization

The dashboard saves your widget layout in browser localStorage. You can:
- Add/remove widgets using the "+ Add Widget" button
- Drag and drop widgets to reorder them
- Reset to default layout with the "Reset Layout" button

## 🏗️ Architecture

```
xWeb/
├── server.js              # Main Express server
├── modules/               # Backend modules
│   ├── rss-reader.js     # RSS feed parser
│   ├── irc-client.js     # IRC client implementation
│   ├── social-media.js   # Social media aggregator
│   ├── diagnostics.js    # System diagnostics
│   └── file-editor.js    # File operations
└── public/                # Frontend assets
    ├── index.html        # Main HTML
    ├── css/style.css     # Styles
    └── js/app.js         # Frontend JavaScript
```

## 🔒 Security

- File operations are restricted to the workspace directory
- File size limits prevent memory issues
- Path validation prevents directory traversal attacks
- Terminal commands run in isolated child processes

## 🔒 Security

⚠️ **Important**: xWeb is designed for **local development use only**. 

- Intended for use on `localhost` by a single trusted user
- Not hardened for production or public internet exposure
- See [SECURITY.md](SECURITY.md) for detailed security considerations

For production deployment, additional security measures are required (authentication, rate limiting, input validation, etc.).

## 🛠️ Development

The codebase is designed with modularity in mind:
- Each feature is a separate module
- Easy to extend with new widgets
- Minimal coupling between components

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add new widget types
- Improve existing features
- Fix bugs
- Enhance documentation

## 🌟 Future Enhancements

- [ ] Multiple dashboard layouts
- [ ] Widget configuration persistence
- [ ] More social media integrations
- [ ] Advanced terminal features (history, autocomplete)
- [ ] Code syntax highlighting in editor
- [ ] File tree viewer
- [ ] Notification system
- [ ] Dark/light theme toggle
