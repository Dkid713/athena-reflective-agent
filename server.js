
const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;

// Serve static files
app.use(express.static('.'));

// Serve the dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to get memory graph data
app.get('/api/memory-graph', (req, res) => {
  // This would integrate with your Athena agent to get real data
  const data = {
    nodes: [
      { id: "n1", label: "Observation: anomaly detected", group: "observation" },
      { id: "n2", label: "Decision: alert triggered", group: "decision" },
      { id: "n3", label: "Interaction: user notified", group: "interaction" }
    ],
    links: [
      { source: "n1", target: "n2" },
      { source: "n2", target: "n3" }
    ]
  };
  res.json(data);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 [WEB] Athena Dashboard running at http://0.0.0.0:${PORT}`);
});
