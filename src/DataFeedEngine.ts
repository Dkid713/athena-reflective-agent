
import { AthenaReflector, MemoryNode } from './AthenaReflector';

export interface FeedSource {
  id: string;
  name: string;
  type: 'academic' | 'news' | 'market' | 'sentiment';
  url: string;
  isActive: boolean;
}

export interface DataPoint {
  id: string;
  source: string;
  title: string;
  content: string;
  timestamp: Date;
  relevanceScore: number;
  sentiment?: number;
  metadata: Record<string, any>;
}

export class DataFeedEngine {
  private reflector?: AthenaReflector;
  private feedSources: Map<string, FeedSource> = new Map();
  private lastFetchTimes: Map<string, Date> = new Map();

  constructor() {
    this.initializeFeedSources();
  }

  setReflector(reflector: AthenaReflector): void {
    this.reflector = reflector;
  }

  private initializeFeedSources(): void {
    const sources: FeedSource[] = [
      {
        id: 'arxiv',
        name: 'arXiv Academic Papers',
        type: 'academic',
        url: 'http://export.arxiv.org/api/query',
        isActive: true
      },
      {
        id: 'pubmed',
        name: 'PubMed Medical Research',
        type: 'academic', 
        url: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
        isActive: true
      },
      {
        id: 'google_news',
        name: 'Google News',
        type: 'news',
        url: 'https://news.google.com/rss',
        isActive: true
      },
      {
        id: 'market_data',
        name: 'Market Data Feed',
        type: 'market',
        url: 'https://api.marketdata.app/v1',
        isActive: true
      }
    ];

    sources.forEach(source => {
      this.feedSources.set(source.id, source);
      this.lastFetchTimes.set(source.id, new Date(0));
    });
  }

  async startDataIngestion(): Promise<void> {
    console.log('🌐 [DATA FEED] Starting continuous data ingestion...');
    
    // Run initial fetch
    await this.fetchAllFeeds();
    
    // Set up periodic fetching
    setInterval(async () => {
      await this.fetchAllFeeds();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private async fetchAllFeeds(): Promise<void> {
    for (const [sourceId, source] of this.feedSources) {
      if (source.isActive) {
        try {
          await this.fetchFeedData(sourceId);
        } catch (error) {
          console.error(`❌ [DATA FEED] Error fetching ${source.name}:`, error);
        }
      }
    }
  }

  private async fetchFeedData(sourceId: string): Promise<void> {
    const source = this.feedSources.get(sourceId);
    if (!source) return;

    console.log(`📡 [DATA FEED] Fetching from ${source.name}...`);

    switch (sourceId) {
      case 'arxiv':
        await this.fetchArxivData();
        break;
      case 'pubmed':
        await this.fetchPubMedData();
        break;
      case 'google_news':
        await this.fetchGoogleNewsData();
        break;
      case 'market_data':
        await this.fetchMarketData();
        break;
    }

    this.lastFetchTimes.set(sourceId, new Date());
  }

  private async fetchArxivData(): Promise<void> {
    const query = 'cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL'; // AI, ML, Computational Linguistics
    const url = `http://export.arxiv.org/api/query?search_query=${query}&max_results=10&sortBy=submittedDate&sortOrder=descending`;

    try {
      // Simulate API call - in production, use actual HTTP client
      const simulatedData = this.generateSimulatedArxivData();
      
      for (const paper of simulatedData) {
        await this.processDataPoint({
          id: `arxiv-${paper.id}`,
          source: 'arXiv',
          title: paper.title,
          content: paper.abstract,
          timestamp: new Date(),
          relevanceScore: this.calculateRelevanceScore(paper.abstract, ['AI', 'machine learning', 'neural network']),
          metadata: {
            authors: paper.authors,
            category: paper.category,
            url: paper.url
          }
        });
      }
    } catch (error) {
      console.error('❌ [ARXIV] Fetch error:', error);
    }
  }

  private async fetchPubMedData(): Promise<void> {
    const searchTerms = 'artificial intelligence OR machine learning OR neural networks';
    
    try {
      // Simulate PubMed data
      const simulatedData = this.generateSimulatedPubMedData();
      
      for (const article of simulatedData) {
        await this.processDataPoint({
          id: `pubmed-${article.pmid}`,
          source: 'PubMed',
          title: article.title,
          content: article.abstract,
          timestamp: new Date(),
          relevanceScore: this.calculateRelevanceScore(article.abstract, ['medical AI', 'healthcare', 'diagnosis']),
          metadata: {
            pmid: article.pmid,
            journal: article.journal,
            publishDate: article.publishDate
          }
        });
      }
    } catch (error) {
      console.error('❌ [PUBMED] Fetch error:', error);
    }
  }

  private async fetchGoogleNewsData(): Promise<void> {
    try {
      // Simulate Google News RSS data
      const simulatedData = this.generateSimulatedNewsData();
      
      for (const article of simulatedData) {
        const sentiment = this.analyzeSentiment(article.content);
        
        await this.processDataPoint({
          id: `news-${Date.now()}-${Math.random()}`,
          source: 'Google News',
          title: article.title,
          content: article.content,
          timestamp: new Date(),
          relevanceScore: this.calculateRelevanceScore(article.content, ['AI', 'technology', 'innovation']),
          sentiment: sentiment,
          metadata: {
            url: article.url,
            source: article.source,
            category: 'technology'
          }
        });
      }
    } catch (error) {
      console.error('❌ [NEWS] Fetch error:', error);
    }
  }

  private async fetchMarketData(): Promise<void> {
    try {
      // Simulate market data
      const simulatedData = this.generateSimulatedMarketData();
      
      for (const dataPoint of simulatedData) {
        await this.processDataPoint({
          id: `market-${dataPoint.symbol}-${Date.now()}`,
          source: 'Market Data',
          title: `${dataPoint.symbol} Market Update`,
          content: `${dataPoint.symbol} traded at $${dataPoint.price}, ${dataPoint.change > 0 ? 'up' : 'down'} ${Math.abs(dataPoint.change)}%`,
          timestamp: new Date(),
          relevanceScore: Math.abs(dataPoint.change) / 10, // Higher volatility = higher relevance
          sentiment: dataPoint.change > 0 ? 0.7 : 0.3,
          metadata: {
            symbol: dataPoint.symbol,
            price: dataPoint.price,
            change: dataPoint.change,
            volume: dataPoint.volume
          }
        });
      }
    } catch (error) {
      console.error('❌ [MARKET] Fetch error:', error);
    }
  }

  private async processDataPoint(dataPoint: DataPoint): Promise<void> {
    if (!this.reflector) return;

    // Create memory node from data point
    const memoryNode: MemoryNode = {
      id: `feed-${dataPoint.id}`,
      type: 'observation',
      content: `${dataPoint.title}: ${dataPoint.content.substring(0, 200)}...`,
      createdAt: dataPoint.timestamp,
      scope: 'global',
      tags: [
        dataPoint.source.toLowerCase().replace(/\s+/g, '-'),
        'external-feed',
        dataPoint.relevanceScore > 0.7 ? 'high-relevance' : 'standard-relevance'
      ],
      confidence: Math.min(dataPoint.relevanceScore, 0.95),
      links: []
    };

    // Add sentiment tags if available
    if (dataPoint.sentiment !== undefined) {
      if (dataPoint.sentiment > 0.6) {
        memoryNode.tags.push('positive-sentiment');
      } else if (dataPoint.sentiment < 0.4) {
        memoryNode.tags.push('negative-sentiment');
      } else {
        memoryNode.tags.push('neutral-sentiment');
      }
    }

    // Store in reflector memory
    this.reflector.storeMemory(memoryNode);
    
    console.log(`🧠 [MEMORY] Stored data from ${dataPoint.source}: ${dataPoint.title.substring(0, 50)}...`);
  }

  private calculateRelevanceScore(content: string, keywords: string[]): number {
    const contentLower = content.toLowerCase();
    let score = 0;
    
    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const matches = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
      score += matches * 0.1;
    });
    
    return Math.min(score, 1.0);
  }

  private analyzeSentiment(text: string): number {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['breakthrough', 'innovation', 'success', 'growth', 'improve', 'advance'];
    const negativeWords = ['crisis', 'decline', 'failure', 'problem', 'risk', 'concern'];
    
    const textLower = text.toLowerCase();
    let sentiment = 0.5; // neutral baseline
    
    positiveWords.forEach(word => {
      const matches = (textLower.match(new RegExp(word, 'g')) || []).length;
      sentiment += matches * 0.1;
    });
    
    negativeWords.forEach(word => {
      const matches = (textLower.match(new RegExp(word, 'g')) || []).length;
      sentiment -= matches * 0.1;
    });
    
    return Math.max(0, Math.min(1, sentiment));
  }

  // Simulation methods for demonstration
  private generateSimulatedArxivData() {
    return [
      {
        id: 'arxiv-001',
        title: 'Advances in Neural Architecture Search for Efficient AI Models',
        abstract: 'This paper presents novel approaches to neural architecture search that optimize for both performance and computational efficiency in AI systems.',
        authors: ['Dr. Jane Smith', 'Prof. John Doe'],
        category: 'cs.AI',
        url: 'https://arxiv.org/abs/2024.001'
      },
      {
        id: 'arxiv-002', 
        title: 'Transformer Models for Real-time Language Processing',
        abstract: 'We introduce optimized transformer architectures capable of real-time natural language processing with reduced computational overhead.',
        authors: ['Dr. Alice Chen', 'Dr. Bob Wilson'],
        category: 'cs.CL',
        url: 'https://arxiv.org/abs/2024.002'
      }
    ];
  }

  private generateSimulatedPubMedData() {
    return [
      {
        pmid: '12345678',
        title: 'AI-Assisted Medical Diagnosis: A Comprehensive Review',
        abstract: 'This review examines the current state of artificial intelligence applications in medical diagnosis and their clinical effectiveness.',
        journal: 'Journal of Medical AI',
        publishDate: '2024-01-15'
      }
    ];
  }

  private generateSimulatedNewsData() {
    return [
      {
        title: 'Tech Giants Announce Major AI Breakthrough',
        content: 'Leading technology companies have announced significant advances in artificial intelligence capabilities, promising improved efficiency and new applications.',
        url: 'https://news.example.com/ai-breakthrough',
        source: 'Tech News Daily'
      }
    ];
  }

  private generateSimulatedMarketData() {
    return [
      {
        symbol: 'AAPL',
        price: 175.50,
        change: 2.5,
        volume: 50000000
      },
      {
        symbol: 'GOOGL',
        price: 2420.75,
        change: -1.2,
        volume: 15000000
      },
      {
        symbol: 'MSFT',
        price: 310.25,
        change: 0.8,
        volume: 25000000
      }
    ];
  }

  getLastFetchTime(sourceId: string): Date | undefined {
    return this.lastFetchTimes.get(sourceId);
  }

  getFeedStatus(): { [key: string]: { active: boolean; lastFetch: Date | undefined } } {
    const status: { [key: string]: { active: boolean; lastFetch: Date | undefined } } = {};
    
    for (const [id, source] of this.feedSources) {
      status[id] = {
        active: source.isActive,
        lastFetch: this.lastFetchTimes.get(id)
      };
    }
    
    return status;
  }
}
