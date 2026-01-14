const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Modules
const rssReader = require('./modules/rss-reader');
const ircClient = require('./modules/irc-client');
const socialMedia = require('./modules/social-media');
const diagnostics = require('./modules/diagnostics');
const fileEditor = require('./modules/file-editor');

// API Routes
app.get('/api/rss/feeds', rssReader.getFeeds);
app.post('/api/rss/add', rssReader.addFeed);
app.delete('/api/rss/remove/:id', rssReader.removeFeed);

app.get('/api/irc/channels', ircClient.getChannels);
app.post('/api/irc/connect', ircClient.connect);
app.post('/api/irc/disconnect', ircClient.disconnect);
app.get('/api/irc/messages/:channel', ircClient.getMessages);

app.get('/api/social/feeds', socialMedia.getFeeds);
app.post('/api/social/refresh', socialMedia.refreshFeeds);

app.get('/api/diagnostics/system', diagnostics.getSystemInfo);
app.get('/api/diagnostics/process', diagnostics.getProcessInfo);

app.get('/api/files/list', fileEditor.listFiles);
app.get('/api/files/read', fileEditor.readFile);
app.post('/api/files/write', fileEditor.writeFile);

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function handleWebSocketMessage(ws, data) {
  switch (data.type) {
    case 'terminal':
      // Handle terminal commands with basic validation
      if (data.command) {
        // Basic command sanitization - prevent command chaining and subshells
        const sanitizedCommand = data.command.split(/[;&|`$()]/)[0].trim();
        
        exec(sanitizedCommand, { timeout: 10000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
          let output = '';
          if (error) {
            output = `Error: ${error.message}\n${stderr}`;
          } else {
            output = stdout || stderr;
          }
          ws.send(JSON.stringify({
            type: 'terminal',
            output: output
          }));
        });
      }
      break;
    case 'irc':
      // Handle IRC updates
      ws.send(JSON.stringify({
        type: 'irc',
        data: { message: 'IRC message handling' }
      }));
      break;
  }
}

// Start server
server.listen(PORT, () => {
  console.log(`xWeb Dashboard running on http://localhost:${PORT}`);
});
