
import { athenaReflectorService } from './athenaReflectorService';
import { MemoryNode } from './AthenaReflector';

export class TopicClusteringEngine {
  private clusters: Map<string, string[]> = new Map();

  async processTopics(feedItems: any[]): Promise<void> {
    console.log('[TRENDS] Processing topics for clustering...');
    
    // Simple clustering based on keywords
    const keywords = this.extractKeywords(feedItems);
    const clustered = this.clusterByKeywords(keywords);
    
    // Store clusters as memory nodes
    for (const [topic, items] of clustered.entries()) {
      const memoryNode: MemoryNode = {
        id: `trend-${topic}-${Date.now()}`,
        type: 'trend',
        content: `Trending topic: ${topic} (${items.length} items)`,
        createdAt: new Date(),
        scope: 'global',
        tags: ['trend', 'cluster', topic],
        confidence: 0.8
      };
      
      athenaReflectorService.reflector?.storeMemory(memoryNode);
    }
    
    console.log(`[TRENDS] Created ${clustered.size} topic clusters`);
  }

  private extractKeywords(items: any[]): string[] {
    const keywords: string[] = [];
    items.forEach(item => {
      if (item.title) {
        const words = item.title.toLowerCase().split(/\s+/);
        keywords.push(...words.filter(w => w.length > 3));
      }
    });
    return keywords;
  }

  private clusterByKeywords(keywords: string[]): Map<string, string[]> {
    const clusters = new Map<string, string[]>();
    const counts = new Map<string, number>();
    
    // Count keyword frequency
    keywords.forEach(keyword => {
      counts.set(keyword, (counts.get(keyword) || 0) + 1);
    });
    
    // Group by frequency thresholds
    for (const [keyword, count] of counts.entries()) {
      if (count >= 2) {
        if (!clusters.has(keyword)) {
          clusters.set(keyword, []);
        }
        clusters.get(keyword)!.push(keyword);
      }
    }
    
    return clusters;
  }
}
