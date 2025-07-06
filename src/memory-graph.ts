
export interface GraphNode {
  id: string;
  label: string;
  group: string;
}

export class MemoryGraph {
  private nodes: Map<string, GraphNode> = new Map();

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    console.log(`[MEMORY] Added node: ${node.id}`);
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }
}
