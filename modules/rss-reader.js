const https = require('https');
const http = require('http');

let feeds = [
  {
    id: 1,
    name: 'BBC News',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
    items: []
  }
];

function sanitizeHTML(html) {
  if (!html) return '';
  // Remove all script tags and their content (including malformed ones)
  let sanitized = html.replace(/<script[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  // Remove any remaining HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  // Remove CDATA sections
  sanitized = sanitized.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
  return sanitized;
}

function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title>([\s\S]*?)<\/title>/;
  const linkRegex = /<link>([\s\S]*?)<\/link>/;
  const descRegex = /<description>([\s\S]*?)<\/description>/;
  const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;
  
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = titleRegex.exec(itemXml);
    const link = linkRegex.exec(itemXml);
    const desc = descRegex.exec(itemXml);
    const pubDate = pubDateRegex.exec(itemXml);
    
    items.push({
      title: title ? sanitizeHTML(title[1]) : '',
      link: link ? link[1] : '',
      description: desc ? sanitizeHTML(desc[1]) : '',
      pubDate: pubDate ? pubDate[1] : ''
    });
  }
  
  return items;
}

function fetchFeed(feedUrl) {
  return new Promise((resolve, reject) => {
    const protocol = feedUrl.startsWith('https') ? https : http;
    
    protocol.get(feedUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const items = parseRSS(data);
          resolve(items);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function updateFeeds() {
  for (const feed of feeds) {
    try {
      feed.items = await fetchFeed(feed.url);
    } catch (error) {
      console.error(`Error fetching feed ${feed.name}:`, error.message);
      feed.items = [];
    }
  }
}

// Update feeds every 5 minutes
setInterval(updateFeeds, 5 * 60 * 1000);
updateFeeds(); // Initial fetch

module.exports = {
  getFeeds: async (req, res) => {
    await updateFeeds();
    res.json(feeds);
  },
  
  addFeed: (req, res) => {
    const { name, url } = req.body;
    const newFeed = {
      id: feeds.length > 0 ? Math.max(...feeds.map(f => f.id)) + 1 : 1,
      name,
      url,
      items: []
    };
    feeds.push(newFeed);
    fetchFeed(url).then(items => {
      newFeed.items = items;
    }).catch(err => {
      console.error('Error fetching new feed:', err);
    });
    res.json(newFeed);
  },
  
  removeFeed: (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = feeds.length;
    feeds = feeds.filter(f => f.id !== id);
    if (feeds.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Feed not found' });
    }
    res.json({ success: true });
  }
};
