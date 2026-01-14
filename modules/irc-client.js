const net = require('net');

let connections = [];
let channels = [];
let messages = {};

class IRCConnection {
  constructor(server, port, nick, channel) {
    this.server = server;
    this.port = port;
    this.nick = nick;
    this.channel = channel;
    this.client = null;
    this.connected = false;
  }
  
  connect() {
    return new Promise((resolve, reject) => {
      this.client = new net.Socket();
      
      this.client.connect(this.port, this.server, () => {
        console.log(`Connected to ${this.server}:${this.port}`);
        this.client.write(`NICK ${this.nick}\r\n`);
        this.client.write(`USER ${this.nick} 0 * :xWeb IRC Client\r\n`);
        this.connected = true;
        
        // Join channel after a delay
        setTimeout(() => {
          this.client.write(`JOIN ${this.channel}\r\n`);
        }, 2000);
        
        resolve();
      });
      
      this.client.on('data', (data) => {
        const lines = data.toString().split('\r\n');
        
        lines.forEach((line) => {
          if (line.includes('PING')) {
            this.client.write(line.replace('PING', 'PONG') + '\r\n');
          }
          
          // Parse PRIVMSG
          const msgMatch = line.match(/:(.+?)!.+? PRIVMSG (.+?) :(.+)/);
          if (msgMatch) {
            const [, user, channel, message] = msgMatch;
            if (!messages[channel]) {
              messages[channel] = [];
            }
            messages[channel].push({
              user,
              message,
              timestamp: new Date().toISOString()
            });
            // Keep last 100 messages
            if (messages[channel].length > 100) {
              messages[channel].shift();
            }
          }
        });
      });
      
      this.client.on('error', (error) => {
        console.error('IRC Error:', error);
        reject(error);
      });
      
      this.client.on('close', () => {
        console.log('IRC connection closed');
        this.connected = false;
      });
    });
  }
  
  disconnect() {
    if (this.client) {
      this.client.write('QUIT :xWeb IRC Client\r\n');
      this.client.destroy();
      this.connected = false;
    }
  }
  
  sendMessage(message) {
    if (this.client && this.connected) {
      this.client.write(`PRIVMSG ${this.channel} :${message}\r\n`);
    }
  }
}

module.exports = {
  getChannels: (req, res) => {
    res.json(channels);
  },
  
  connect: async (req, res) => {
    const { server, port, nick, channel } = req.body;
    
    try {
      const conn = new IRCConnection(server, port || 6667, nick, channel);
      await conn.connect();
      
      connections.push(conn);
      channels.push({
        server,
        channel,
        nick,
        connected: true
      });
      
      res.json({ success: true, message: 'Connected to IRC' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  
  disconnect: (req, res) => {
    connections.forEach(conn => conn.disconnect());
    connections = [];
    channels = [];
    res.json({ success: true });
  },
  
  getMessages: (req, res) => {
    const channel = req.params.channel;
    res.json(messages[channel] || []);
  }
};
