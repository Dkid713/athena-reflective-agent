// Athena Agent Dashboard
class AthenaGraphVisualizer {
  constructor() {
    this.width = 800;
    this.height = 600;
    this.svg = null;
    this.simulation = null;
    this.init();
  }

  init() {
    this.svg = d3.select("#graph-container")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.loadData();
    setInterval(() => this.loadData(), 5000);
  }

  async loadData() {
    try {
      const response = await fetch('/api/memory-graph');
      const data = await response.json();
      this.renderGraph(data);
      console.log('Data refreshed at', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  renderGraph(data) {
    this.svg.selectAll("*").remove();

    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));

    const link = this.svg.append("g")
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-width", 2);

    const node = this.svg.append("g")
      .selectAll("circle")
      .data(data.nodes)
      .enter().append("circle")
      .attr("r", 8)
      .attr("fill", d => this.getNodeColor(d.group))
      .attr("class", "node")
      .call(d3.drag()
        .on("start", this.dragstarted.bind(this))
        .on("drag", this.dragged.bind(this))
        .on("end", this.dragended.bind(this)));

    const labels = this.svg.append("g")
      .selectAll("text")
      .data(data.nodes)
      .enter().append("text")
      .text(d => d.label)
      .attr("font-size", 10)
      .attr("fill", "white")
      .attr("text-anchor", "middle");

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
        .attr("x", d => d.x)
        .attr("y", d => d.y + 3);
    });
  }

  getNodeColor(group) {
    const colors = {
      observation: "#ff6b6b",
      interaction: "#4ecdc4",
      reflection: "#45b7d1",
      decision: "#f9ca24"
    };
    return colors[group] || "#95a5a6";
  }

  dragstarted(event, d) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  dragended(event, d) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new AthenaGraphVisualizer();
});