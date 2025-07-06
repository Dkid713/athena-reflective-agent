
// Athena Reflective Agent Memory Graph
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

const width = document.getElementById("graph-container").clientWidth;
const height = document.getElementById("graph-container").clientHeight;

const svg = d3.select("#graph-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const color = d3.scaleOrdinal(d3.schemeCategory10);

const simulation = d3.forceSimulation(data.nodes)
  .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
  .force("charge", d3.forceManyBody().strength(-400))
  .force("center", d3.forceCenter(width / 2, height / 2));

const link = svg.append("g")
  .attr("stroke", "#999")
  .attr("stroke-opacity", 0.6)
  .selectAll("line")
  .data(data.links)
  .enter().append("line")
  .attr("stroke-width", 2);

const node = svg.append("g")
  .attr("stroke", "#fff")
  .attr("stroke-width", 1.5)
  .selectAll("circle")
  .data(data.nodes)
  .enter().append("circle")
  .attr("r", 10)
  .attr("fill", d => color(d.group))
  .call(drag(simulation));

node.append("title")
  .text(d => d.label);

const text = svg.append("g")
  .selectAll("text")
  .data(data.nodes)
  .enter().append("text")
  .text(d => d.label)
  .attr("font-size", "12px")
  .attr("fill", "white")
  .attr("text-anchor", "middle")
  .attr("dy", ".35em");

simulation.on("tick", () => {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  node
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

  text
    .attr("x", d => d.x)
    .attr("y", d => d.y);
});

function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  
  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

// Real-time data fetching
async function fetchLiveData() {
  try {
    const response = await fetch('/api/memory-graph');
    const liveData = await response.json();
    updateVisualization(liveData);
  } catch (error) {
    console.error('Error fetching live data:', error);
  }
}

function updateVisualization(newData) {
  // Update nodes
  const nodes = svg.selectAll("circle")
    .data(newData.nodes, d => d.id);

  nodes.enter()
    .append("circle")
    .attr("r", 10)
    .attr("fill", d => color(d.group))
    .call(drag(simulation));

  nodes.exit().remove();

  // Update links
  const links = svg.selectAll("line")
    .data(newData.links);

  links.enter()
    .append("line")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 2);

  links.exit().remove();

  // Restart simulation
  simulation.nodes(newData.nodes);
  simulation.force("link").links(newData.links);
  simulation.alpha(1).restart();
}

// Fetch live data every 5 seconds
setInterval(fetchLiveData, 5000);
