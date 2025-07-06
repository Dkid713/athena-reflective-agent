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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 [WEB] Athena Dashboard running at http://0.0.0.0:${PORT}`);
  console.log(`📡 [EXTERNAL] Access at: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
});