const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = process.cwd();
const MAX_FILE_SIZE = 1024 * 1024; // 1MB limit for safety

function listFiles(dir, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return [];
  
  try {
    const items = fs.readdirSync(dir);
    const files = [];
    
    for (const item of items) {
      // Skip hidden files, node_modules, and .git
      if (item.startsWith('.') || item === 'node_modules') continue;
      
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        files.push({
          name: item,
          path: fullPath.replace(WORKSPACE_DIR, ''),
          type: 'directory',
          children: listFiles(fullPath, depth + 1, maxDepth)
        });
      } else if (stats.isFile()) {
        files.push({
          name: item,
          path: fullPath.replace(WORKSPACE_DIR, ''),
          type: 'file',
          size: stats.size,
          modified: stats.mtime
        });
      }
    }
    
    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}

module.exports = {
  listFiles: (req, res) => {
    const dir = req.query.dir || WORKSPACE_DIR;
    const files = listFiles(dir);
    res.json(files);
  },
  
  readFile: (req, res) => {
    const filePath = req.query.path;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path required' });
    }
    
    const fullPath = path.join(WORKSPACE_DIR, filePath);
    
    // Security check: ensure path is within workspace
    if (!fullPath.startsWith(WORKSPACE_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
      const stats = fs.statSync(fullPath);
      
      if (stats.size > MAX_FILE_SIZE) {
        return res.status(413).json({ error: 'File too large' });
      }
      
      const content = fs.readFileSync(fullPath, 'utf8');
      res.json({ content, path: filePath });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  writeFile: (req, res) => {
    const { path: filePath, content } = req.body;
    
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'File path and content required' });
    }
    
    const fullPath = path.join(WORKSPACE_DIR, filePath);
    
    // Security check: ensure path is within workspace
    if (!fullPath.startsWith(WORKSPACE_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    try {
      fs.writeFileSync(fullPath, content, 'utf8');
      res.json({ success: true, path: filePath });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
