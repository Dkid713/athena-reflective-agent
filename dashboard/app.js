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

// Uses D3.js to draw a force-directed graph
