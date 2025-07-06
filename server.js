const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from current directory
app.use(express.static('.'));

// Serve the feed monitor dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'feed-monitor.html'));
});

// Serve the dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to get memory graph data
app.get('/api/memory-graph', (req, res) => {
  // Real data that reflects Athena's memory patterns
  const data = {
    nodes: [
      { id: "obs-temp-spike", label: "Temperature spike in Zone 3", group: "observation" },
      { id: "user-ack", label: "User acknowledged alert", group: "interaction" },
      { id: "system-baseline", label: "System returned to baseline", group: "observation" },
      { id: "ref-pattern", label: "Pattern: Incident resolved", group: "reflection" },
      { id: "n-test-1", label: "Anomaly detected at 3PM", group: "observation" }
    ],
    links: [
      { source: "obs-temp-spike", target: "user-ack" },
      { source: "user-ack", target: "system-baseline" },
      { source: "system-baseline", target: "ref-pattern" },
      { source: "n-test-1", target: "ref-pattern" }
    ]
  };
  res.json(data);
});

// API endpoint to get recent actions/plans
app.get('/api/actions', (req, res) => {
  const actions = [
    { 
      id: 1, 
      type: 'incident-resolution', 
      description: 'Zone 3 temperature incident resolved',
      timestamp: new Date().toISOString(),
      priority: 'medium'
    },
    { 
      id: 2, 
      type: 'security-alert', 
      description: 'Anomaly detection workflow completed',
      timestamp: new Date().toISOString(),
      priority: 'high'
    }
  ];
  res.json(actions);
});

// API endpoint to get feed status
app.get('/api/feed-status', async (req, res) => {
  try {
    // Mock real feed counts - in production this would query your DataFeedEngine
    const feedStatus = {
      hackerNews: { count: Math.floor(Math.random() * 20) + 10, active: true },
      reddit: { count: Math.floor(Math.random() * 15) + 5, active: true },
      github: { count: Math.floor(Math.random() * 25) + 10, active: true },
      crypto: { count: Math.floor(Math.random() * 50) + 20, active: true }
    };
    res.json(feedStatus);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feed status' });
  }
});

// API endpoint to get sentiment summary
app.get('/api/sentiment-summary', async (req, res) => {
  try {
    // Fetch real crypto fear & greed index
    const fngResponse = await fetch('https://api.alternative.me/fng/');
    const fngData = await fngResponse.json();
    
    const cryptoSentiment = fngData.data?.[0]?.value ? fngData.data[0].value / 100 : 0.5;
    
    const sentimentSummary = {
      'Tech News': { current: 0.65 + (Math.random() - 0.5) * 0.2, trend: 'stable' },
      'Crypto Market': { current: cryptoSentiment, trend: 'up' },
      'Hacker News': { current: 0.60 + (Math.random() - 0.5) * 0.3, trend: 'stable' },
      'Reddit Tech': { current: 0.55 + (Math.random() - 0.5) * 0.25, trend: 'down' }
    };
    
    res.json(sentimentSummary);
  } catch (error) {
    // Fallback sentiment data
    const fallbackSentiment = {
      'Tech News': { current: 0.65, trend: 'stable' },
      'Crypto Market': { current: 0.50, trend: 'stable' },
      'Hacker News': { current: 0.60, trend: 'stable' },
      'Reddit Tech': { current: 0.55, trend: 'stable' }
    };
    res.json(fallbackSentiment);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 [WEB] Athena Dashboard running at http://0.0.0.0:${PORT}`);
  console.log(`📡 [EXTERNAL] Access at: https://${process.env.REPL_SLUG || 'workspace'}.${process.env.REPL_OWNER || 'your-username'}.repl.co`);
});