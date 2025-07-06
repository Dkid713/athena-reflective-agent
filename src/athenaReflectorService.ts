
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
  }

  addMemory(node: MemoryNode): void {
    this.reflector.storeMemory(node);
  }
}
