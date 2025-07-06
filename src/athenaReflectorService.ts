import { AthenaReflector, MemoryNode } from './AthenaReflector';

export class AthenaReflectorService {
  private reflector: AthenaReflector;
  public graph: any; // For test injection

  constructor() {
    this.reflector = new AthenaReflector();
  }

  async initialize(): Promise<void> {
    console.log('[INIT] AthenaReflectorService initialized');
  }

  async run(): Promise<void> {
    console.log('[REFLECT] Running reflection cycle...');

    // Example introspection on a test goal
    const result = this.reflector.introspect('anomaly');
    console.log('[REFLECT] Introspection result:', result);

    // Generate reflection nodes based on patterns
    const reflectionNode = this.generateReflectionNode();
    if (reflectionNode) {
      this.reflector.storeMemory(reflectionNode);
      console.log(`[REFLECT] Generated reflection: ${reflectionNode.content}`);
    }
  }

  private generateReflectionNode(): MemoryNode | null {
    // Simple pattern detection for demo
    return {
      id: `reflection-${Date.now()}`,
      type: 'reflection',
      content: 'Pattern detected: System anomaly followed by recovery',
      createdAt: new Date(),
      scope: 'global',
      tags: ['pattern', 'anomaly', 'recovery'],
      confidence: 0.85
    };
  }

  private detectSequentialPattern(memories: MemoryNode[], sequence: string[]): boolean {
    const timeWindow = 5 * 60 * 1000; // 5 minutes
    const now = new Date().getTime();

    // Get recent memories within time window
    const recentMemories = memories.filter(m => 
      now - m.createdAt.getTime() < timeWindow
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // Check if sequence appears in chronological order
    let sequenceIndex = 0;
    for (const memory of recentMemories) {
      if (sequenceIndex < sequence.length && 
          memory.content.toLowerCase().includes(sequence[sequenceIndex].toLowerCase())) {
        sequenceIndex++;
        if (sequenceIndex === sequence.length) {
          return true;
        }
      }
    }

    return false;
  }

  private getPatternLinks(memories: MemoryNode[], sequence: string[]): string[] {
    const links: string[] = [];
    for (const memory of memories) {
      if (sequence.some(seq => memory.content.toLowerCase().includes(seq.toLowerCase()))) {
        links.push(memory.id);
      }
    }
    return links;
  }

  addMemory(node: MemoryNode): void {
    this.reflector.storeMemory(node);
  }
}

// Export named singleton for module consumers
export const athenaReflectorService = new AthenaReflectorService();
export default athenaReflectorService;