const os = require('os');
const fs = require('fs');
const { exec } = require('child_process');

function getSystemInfo() {
  return {
    platform: os.platform(),
    architecture: os.arch(),
    hostname: os.hostname(),
    totalMemory: (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB',
    freeMemory: (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB',
    memoryUsage: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2) + '%',
    cpus: os.cpus().length,
    cpuModel: os.cpus()[0].model,
    uptime: formatUptime(os.uptime()),
    loadAverage: os.loadavg().map(l => l.toFixed(2)),
    networkInterfaces: getNetworkInfo()
  };
}

function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const result = {};
  
  for (const [name, addrs] of Object.entries(interfaces)) {
    result[name] = addrs.map(addr => ({
      address: addr.address,
      family: addr.family,
      internal: addr.internal
    }));
  }
  
  return result;
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function getProcessInfo() {
  return {
    nodeVersion: process.version,
    pid: process.pid,
    processUptime: formatUptime(process.uptime()),
    memoryUsage: {
      rss: (process.memoryUsage().rss / (1024 ** 2)).toFixed(2) + ' MB',
      heapTotal: (process.memoryUsage().heapTotal / (1024 ** 2)).toFixed(2) + ' MB',
      heapUsed: (process.memoryUsage().heapUsed / (1024 ** 2)).toFixed(2) + ' MB',
      external: (process.memoryUsage().external / (1024 ** 2)).toFixed(2) + ' MB'
    },
    cpuUsage: process.cpuUsage()
  };
}

function getDiskUsage() {
  return new Promise((resolve, reject) => {
    if (process.platform === 'win32') {
      exec('wmic logicaldisk get size,freespace,caption', (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    } else {
      exec('df -h', (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    }
  });
}

module.exports = {
  getSystemInfo: (req, res) => {
    try {
      const info = getSystemInfo();
      res.json(info);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  getProcessInfo: (req, res) => {
    try {
      const info = getProcessInfo();
      res.json(info);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  getDiskUsage: async (req, res) => {
    try {
      const usage = await getDiskUsage();
      res.json({ diskUsage: usage });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
