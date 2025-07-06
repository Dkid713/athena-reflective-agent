/**
 * Athena Reflector - Advanced Reflective Agent Core
 * Author: Dennis R. Kidwell (Originator), Codified by OpenAI ChatGPT
 * Architecture: Reflective Agent v2 ("Athena")
 */

export interface MemoryNode {
  id: string;
  type: 'observation' | 'decision' | 'interaction' | 'retrieved';
  content: string;
  createdAt: Date;
  scope: 'local' | 'shared' | 'global';
  tags: string[];
  source?: string;
  confidence: number;
  links: string[];
}

export class AthenaReflector {
  private memory: Map<string, MemoryNode> = new Map();

  storeMemory(node: MemoryNode): void {
    this.memory.set(node.id, node);
  }

  introspect(goal: string): string {
    const related = [...this.memory.values()]
      .filter(n => n.content.includes(goal) || n.tags.includes(goal))
      .sort((a, b) => b.confidence - a.confidence);

    return related.map(n => `Node: ${n.id} (${n.type}) -> ${n.content}`).join("\n");
  }

  traceCausalChain(nodeId: string, depth = 3): string[] {
    const chain: string[] = [];
    const visit = (id: string, level: number) => {
      if (level > depth) return;
      const node = this.memory.get(id);
      if (node) {
        chain.push(`${'  '.repeat(level)}${node.type}: ${node.content}`);
        node.links.forEach(linkId => visit(linkId, level + 1));
      }
    };
    visit(nodeId, 0);
    return chain;
  }

  getRecentReflections(): MemoryNode[] {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    return [...this.memory.values()]
      .filter(node => node.createdAt >= oneHourAgo)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getAllMemoryNodes(): MemoryNode[] {
    return [...this.memory.values()];
  }

  getAllMemoryContents(): string[] {
    return [...this.memory.values()].map(node => node.content);
  }
}
