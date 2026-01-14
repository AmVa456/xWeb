// WebSocket connection
let ws = null;
let widgetIdCounter = 0;

// Initialize WebSocket
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onopen = () => {
        console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting...');
        setTimeout(initWebSocket, 3000);
    };
}

function handleWebSocketMessage(data) {
    if (data.type === 'terminal') {
        const terminal = document.querySelector('.terminal-output');
        if (terminal) {
            terminal.textContent += data.output;
            terminal.scrollTop = terminal.scrollHeight;
        }
    }
}

// Modal handling
const modal = document.getElementById('addWidgetModal');
const addWidgetBtn = document.getElementById('addWidgetBtn');
const closeModal = document.querySelector('.close');

addWidgetBtn.onclick = () => {
    modal.style.display = 'block';
};

closeModal.onclick = () => {
    modal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Widget options
document.querySelectorAll('.widget-option').forEach(option => {
    option.onclick = () => {
        const widgetType = option.getAttribute('data-widget');
        addWidget(widgetType);
        modal.style.display = 'none';
    };
});

// Reset layout
document.getElementById('resetLayoutBtn').onclick = () => {
    if (confirm('Are you sure you want to reset the layout? This will remove all widgets.')) {
        document.getElementById('dashboard').innerHTML = '';
        localStorage.removeItem('dashboardLayout');
        widgetIdCounter = 0;
    }
};

// Add widget
function addWidget(type) {
    const widgetId = `widget-${widgetIdCounter++}`;
    const dashboard = document.getElementById('dashboard');
    
    const widget = document.createElement('div');
    widget.className = 'widget';
    widget.id = widgetId;
    widget.draggable = true;
    
    widget.innerHTML = getWidgetHTML(type, widgetId);
    dashboard.appendChild(widget);
    
    // Setup drag and drop
    setupDragAndDrop(widget);
    
    // Initialize widget functionality
    initializeWidget(type, widgetId);
    
    // Save layout
    saveLayout();
}

function getWidgetHTML(type, widgetId) {
    const templates = {
        rss: `
            <div class="widget-header">
                <div class="widget-title">📰 RSS Feeds</div>
                <div class="widget-controls">
                    <button class="widget-btn" onclick="refreshWidget('${widgetId}', 'rss')">🔄</button>
                    <button class="widget-btn" onclick="removeWidget('${widgetId}')">✕</button>
                </div>
            </div>
            <div class="widget-content" id="${widgetId}-content">
                <p>Loading RSS feeds...</p>
            </div>
        `,
        irc: `
            <div class="widget-header">
                <div class="widget-title">💬 IRC Client</div>
                <div class="widget-controls">
                    <button class="widget-btn" onclick="refreshWidget('${widgetId}', 'irc')">🔄</button>
                    <button class="widget-btn" onclick="removeWidget('${widgetId}')">✕</button>
                </div>
            </div>
            <div class="widget-content" id="${widgetId}-content">
                <div class="irc-controls">
                    <input type="text" placeholder="Server (e.g., irc.freenode.net)" id="${widgetId}-server">
                    <input type="text" placeholder="Channel (e.g., #test)" id="${widgetId}-channel">
                    <input type="text" placeholder="Nickname" id="${widgetId}-nick">
                    <button class="btn" onclick="connectIRC('${widgetId}')">Connect</button>
                </div>
                <div class="irc-messages" id="${widgetId}-messages">
                    <p>Not connected</p>
                </div>
            </div>
        `,
        social: `
            <div class="widget-header">
                <div class="widget-title">📱 Social Media</div>
                <div class="widget-controls">
                    <button class="widget-btn" onclick="refreshWidget('${widgetId}', 'social')">🔄</button>
                    <button class="widget-btn" onclick="removeWidget('${widgetId}')">✕</button>
                </div>
            </div>
            <div class="widget-content" id="${widgetId}-content">
                <p>Loading social media feeds...</p>
            </div>
        `,
        diagnostics: `
            <div class="widget-header">
                <div class="widget-title">🔧 System Diagnostics</div>
                <div class="widget-controls">
                    <button class="widget-btn" onclick="refreshWidget('${widgetId}', 'diagnostics')">🔄</button>
                    <button class="widget-btn" onclick="removeWidget('${widgetId}')">✕</button>
                </div>
            </div>
            <div class="widget-content" id="${widgetId}-content">
                <p>Loading diagnostics...</p>
            </div>
        `,
        editor: `
            <div class="widget-header">
                <div class="widget-title">📝 Code Editor</div>
                <div class="widget-controls">
                    <button class="widget-btn" onclick="removeWidget('${widgetId}')">✕</button>
                </div>
            </div>
            <div class="widget-content" id="${widgetId}-content">
                <div class="editor">
                    <div class="editor-toolbar">
                        <input type="text" placeholder="File path" id="${widgetId}-filepath">
                        <button class="btn" onclick="loadFile('${widgetId}')">Load</button>
                        <button class="btn" onclick="saveFile('${widgetId}')">Save</button>
                    </div>
                    <div class="editor-content">
                        <textarea id="${widgetId}-editor" placeholder="// Start coding..."></textarea>
                    </div>
                </div>
            </div>
        `,
        terminal: `
            <div class="widget-header">
                <div class="widget-title">💻 Terminal</div>
                <div class="widget-controls">
                    <button class="widget-btn" onclick="clearTerminal('${widgetId}')">🗑️</button>
                    <button class="widget-btn" onclick="removeWidget('${widgetId}')">✕</button>
                </div>
            </div>
            <div class="widget-content" id="${widgetId}-content">
                <div class="terminal">
                    <div class="terminal-output" id="${widgetId}-output">xWeb Terminal v1.0\n$ </div>
                    <div class="terminal-input">
                        <input type="text" id="${widgetId}-input" placeholder="Enter command...">
                        <button class="btn" onclick="executeCommand('${widgetId}')">Run</button>
                    </div>
                </div>
            </div>
        `
    };
    
    return templates[type] || '<p>Unknown widget type</p>';
}

// Initialize widget functionality
function initializeWidget(type, widgetId) {
    switch(type) {
        case 'rss':
            loadRSSFeeds(widgetId);
            break;
        case 'irc':
            // IRC requires manual connection
            break;
        case 'social':
            loadSocialFeeds(widgetId);
            break;
        case 'diagnostics':
            loadDiagnostics(widgetId);
            break;
        case 'editor':
            // Editor is ready to use
            break;
        case 'terminal':
            setupTerminal(widgetId);
            break;
    }
}

// RSS Functions
async function loadRSSFeeds(widgetId) {
    try {
        const response = await fetch('/api/rss/feeds');
        const feeds = await response.json();
        
        const content = document.getElementById(`${widgetId}-content`);
        content.innerHTML = '';
        
        feeds.forEach(feed => {
            feed.items.slice(0, 5).forEach(item => {
                const feedItem = document.createElement('div');
                feedItem.className = 'feed-item';
                const description = item.description ? item.description.substring(0, 150) : '';
                feedItem.innerHTML = `
                    <h3>${item.title}</h3>
                    <p>${description}${description ? '...' : ''}</p>
                    <div class="feed-meta">${feed.name} • ${item.pubDate}</div>
                `;
                content.appendChild(feedItem);
            });
        });
    } catch (error) {
        console.error('Error loading RSS feeds:', error);
    }
}

// IRC Functions
async function connectIRC(widgetId) {
    const server = document.getElementById(`${widgetId}-server`).value;
    const channel = document.getElementById(`${widgetId}-channel`).value;
    const nick = document.getElementById(`${widgetId}-nick`).value;
    
    if (!server || !channel || !nick) {
        alert('Please fill in all IRC connection details');
        return;
    }
    
    try {
        const response = await fetch('/api/irc/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ server, channel, nick, port: 6667 })
        });
        
        const result = await response.json();
        const messages = document.getElementById(`${widgetId}-messages`);
        messages.innerHTML = `<p>Connected to ${server} ${channel}</p>`;
        
        // Poll for messages
        setInterval(() => loadIRCMessages(widgetId, channel), 3000);
    } catch (error) {
        console.error('Error connecting to IRC:', error);
    }
}

async function loadIRCMessages(widgetId, channel) {
    try {
        const response = await fetch(`/api/irc/messages/${encodeURIComponent(channel)}`);
        const messages = await response.json();
        
        const messagesDiv = document.getElementById(`${widgetId}-messages`);
        messagesDiv.innerHTML = '';
        
        messages.slice(-20).forEach(msg => {
            const msgEl = document.createElement('div');
            msgEl.className = 'irc-message';
            msgEl.innerHTML = `<span class="user">&lt;${msg.user}&gt;</span> ${msg.message}`;
            messagesDiv.appendChild(msgEl);
        });
    } catch (error) {
        console.error('Error loading IRC messages:', error);
    }
}

// Social Media Functions
async function loadSocialFeeds(widgetId) {
    try {
        const response = await fetch('/api/social/feeds');
        const feeds = await response.json();
        
        const content = document.getElementById(`${widgetId}-content`);
        content.innerHTML = '';
        
        feeds.forEach(feed => {
            feed.posts.forEach(post => {
                const postEl = document.createElement('div');
                postEl.className = 'social-post';
                postEl.innerHTML = `
                    <div class="platform">${feed.platform}</div>
                    <div class="content">${post.content || post.title}</div>
                    <div class="meta">
                        ${post.user || post.subreddit} • 
                        ${post.likes !== undefined ? `❤️ ${post.likes}` : `⬆️ ${post.upvotes}`}
                    </div>
                `;
                content.appendChild(postEl);
            });
        });
    } catch (error) {
        console.error('Error loading social feeds:', error);
    }
}

// Diagnostics Functions
async function loadDiagnostics(widgetId) {
    try {
        const [sysResponse, procResponse] = await Promise.all([
            fetch('/api/diagnostics/system'),
            fetch('/api/diagnostics/process')
        ]);
        
        const sysInfo = await sysResponse.json();
        const procInfo = await procResponse.json();
        
        const content = document.getElementById(`${widgetId}-content`);
        content.innerHTML = `
            <div class="diagnostics-grid">
                <div class="diagnostic-card">
                    <h4>Platform</h4>
                    <p>${sysInfo.platform}</p>
                    <small>${sysInfo.architecture}</small>
                </div>
                <div class="diagnostic-card">
                    <h4>CPU</h4>
                    <p>${sysInfo.cpus} cores</p>
                    <small>${sysInfo.cpuModel}</small>
                </div>
                <div class="diagnostic-card">
                    <h4>Memory</h4>
                    <p>${sysInfo.memoryUsage}</p>
                    <small>${sysInfo.freeMemory} free of ${sysInfo.totalMemory}</small>
                </div>
                <div class="diagnostic-card">
                    <h4>Uptime</h4>
                    <p>${sysInfo.uptime}</p>
                    <small>System uptime</small>
                </div>
                <div class="diagnostic-card">
                    <h4>Node.js</h4>
                    <p>${procInfo.nodeVersion}</p>
                    <small>Process: ${procInfo.pid}</small>
                </div>
                <div class="diagnostic-card">
                    <h4>Heap Memory</h4>
                    <p>${procInfo.memoryUsage.heapUsed}</p>
                    <small>of ${procInfo.memoryUsage.heapTotal}</small>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading diagnostics:', error);
    }
}

// Editor Functions
async function loadFile(widgetId) {
    const filepath = document.getElementById(`${widgetId}-filepath`).value;
    
    if (!filepath) {
        alert('Please enter a file path');
        return;
    }
    
    try {
        const response = await fetch(`/api/files/read?path=${encodeURIComponent(filepath)}`);
        const data = await response.json();
        
        if (data.error) {
            alert(`Error: ${data.error}`);
            return;
        }
        
        document.getElementById(`${widgetId}-editor`).value = data.content;
    } catch (error) {
        console.error('Error loading file:', error);
        alert('Error loading file');
    }
}

async function saveFile(widgetId) {
    const filepath = document.getElementById(`${widgetId}-filepath`).value;
    const content = document.getElementById(`${widgetId}-editor`).value;
    
    if (!filepath) {
        alert('Please enter a file path');
        return;
    }
    
    try {
        const response = await fetch('/api/files/write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: filepath, content })
        });
        
        const result = await response.json();
        
        if (result.error) {
            alert(`Error: ${result.error}`);
            return;
        }
        
        alert('File saved successfully!');
    } catch (error) {
        console.error('Error saving file:', error);
        alert('Error saving file');
    }
}

// Terminal Functions
function setupTerminal(widgetId) {
    const input = document.getElementById(`${widgetId}-input`);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            executeCommand(widgetId);
        }
    });
}

function executeCommand(widgetId) {
    const input = document.getElementById(`${widgetId}-input`);
    const output = document.getElementById(`${widgetId}-output`);
    const command = input.value.trim();
    
    if (!command) return;
    
    output.textContent += `\n$ ${command}\n`;
    input.value = '';
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'terminal',
            command: command
        }));
    } else {
        output.textContent += 'WebSocket not connected\n';
    }
}

function clearTerminal(widgetId) {
    const output = document.getElementById(`${widgetId}-output`);
    output.textContent = 'xWeb Terminal v1.0\n$ ';
}

// Refresh widget
function refreshWidget(widgetId, type) {
    initializeWidget(type, widgetId);
}

// Remove widget
function removeWidget(widgetId) {
    const widget = document.getElementById(widgetId);
    if (widget) {
        widget.remove();
        saveLayout();
    }
}

// Drag and Drop
function setupDragAndDrop(widget) {
    widget.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', widget.innerHTML);
        widget.classList.add('dragging');
    });
    
    widget.addEventListener('dragend', (e) => {
        widget.classList.remove('dragging');
    });
    
    widget.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });
    
    widget.addEventListener('drop', (e) => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        if (dragging && dragging !== widget) {
            const dashboard = document.getElementById('dashboard');
            const allWidgets = [...dashboard.children];
            const dragIndex = allWidgets.indexOf(dragging);
            const dropIndex = allWidgets.indexOf(widget);
            
            if (dragIndex < dropIndex) {
                widget.parentNode.insertBefore(dragging, widget.nextSibling);
            } else {
                widget.parentNode.insertBefore(dragging, widget);
            }
            
            saveLayout();
        }
    });
}

// Save and load layout
function saveLayout() {
    const dashboard = document.getElementById('dashboard');
    const layout = [];
    
    dashboard.querySelectorAll('.widget').forEach(widget => {
        layout.push({
            id: widget.id,
            html: widget.innerHTML
        });
    });
    
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
}

function loadLayout() {
    const saved = localStorage.getItem('dashboardLayout');
    if (saved) {
        const layout = JSON.parse(saved);
        const dashboard = document.getElementById('dashboard');
        
        layout.forEach(item => {
            const widget = document.createElement('div');
            widget.className = 'widget';
            widget.id = item.id;
            widget.draggable = true;
            widget.innerHTML = item.html;
            dashboard.appendChild(widget);
            setupDragAndDrop(widget);
        });
    } else {
        // Add default widgets
        addWidget('rss');
        addWidget('diagnostics');
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initWebSocket();
    loadLayout();
});
