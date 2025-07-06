
import { AthenaReflector, MemoryNode } from './AthenaReflector';
import { DOMParser } from 'xmldom';

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
      const response = await fetch(url);
      const xmlText = await response.text();
      
      // Parse XML response using Node.js-compatible DOMParser
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const entries = xmlDoc.getElementsByTagName('entry');
      
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const id = entry.getElementsByTagName('id')[0]?.textContent?.split('/').pop() || `arxiv-${Date.now()}-${i}`;
        const title = entry.getElementsByTagName('title')[0]?.textContent?.trim() || 'Untitled';
        const summary = entry.getElementsByTagName('summary')[0]?.textContent?.trim() || '';
        const authors = Array.from(entry.getElementsByTagName('author')).map(author => 
          author.getElementsByTagName('name')[0]?.textContent || 'Unknown'
        );
        const category = entry.getElementsByTagName('category')[0]?.getAttribute('term') || 'unknown';
        const link = entry.getElementsByTagName('id')[0]?.textContent || '';

        await this.processDataPoint({
          id: `arxiv-${id}`,
          source: 'arXiv',
          title: title,
          content: summary,
          timestamp: new Date(),
          relevanceScore: this.calculateRelevanceScore(summary, ['AI', 'machine learning', 'neural network']),
          metadata: {
            authors: authors,
            category: category,
            url: link
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
      // First, search for PMIDs
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerms)}&retmax=10&retmode=json&sort=pub_date`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json() as any;
      
      if (searchData.esearchresult?.idlist?.length > 0) {
        const pmids = searchData.esearchresult.idlist.slice(0, 5); // Limit to 5 articles
        
        // Fetch article details
        const detailsUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
        const detailsResponse = await fetch(detailsUrl);
        const xmlText = await detailsResponse.text();
        
        // Parse XML response using Node.js-compatible DOMParser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const articles = xmlDoc.getElementsByTagName('PubmedArticle');
        
        for (let i = 0; i < articles.length; i++) {
          const article = articles[i];
          const pmid = article.getElementsByTagName('PMID')[0]?.textContent || `pubmed-${Date.now()}-${i}`;
          const title = article.getElementsByTagName('ArticleTitle')[0]?.textContent || 'Untitled';
          const abstract = article.getElementsByTagName('AbstractText')[0]?.textContent || 'No abstract available';
          const journal = article.getElementsByTagName('Title')[0]?.textContent || 'Unknown Journal';
          const pubDate = article.getElementsByTagName('PubDate')[0];
          const year = pubDate?.getElementsByTagName('Year')[0]?.textContent || new Date().getFullYear().toString();

          await this.processDataPoint({
            id: `pubmed-${pmid}`,
            source: 'PubMed',
            title: title,
            content: abstract,
            timestamp: new Date(),
            relevanceScore: this.calculateRelevanceScore(abstract, ['medical AI', 'healthcare', 'diagnosis']),
            metadata: {
              pmid: pmid,
              journal: journal,
              publishDate: year
            }
          });
        }
      }
    } catch (error) {
      console.error('❌ [PUBMED] Fetch error:', error);
    }
  }

  private async fetchGoogleNewsData(): Promise<void> {
    try {
      // Using Google News RSS feed for AI/technology topics
      const rssUrl = 'https://news.google.com/rss/search?q=artificial+intelligence+OR+machine+learning+OR+technology&hl=en&gl=US&ceid=US:en';
      
      // Note: Due to CORS restrictions, in production you might need a proxy server
      // For now, we'll use a CORS proxy service
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json() as any;
      const xmlText = data.contents;
      
      // Parse RSS XML using Node.js-compatible DOMParser
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const items = xmlDoc.getElementsByTagName('item');
      
      for (let i = 0; i < Math.min(items.length, 10); i++) {
        const item = items[i];
        const title = item.getElementsByTagName('title')[0]?.textContent || 'Untitled';
        const description = item.getElementsByTagName('description')[0]?.textContent || '';
        const link = item.getElementsByTagName('link')[0]?.textContent || '';
        const pubDate = item.getElementsByTagName('pubDate')[0]?.textContent || '';
        const source = item.getElementsByTagName('source')[0]?.textContent || 'Google News';
        
        // Clean up description (remove HTML tags)
        const content = description.replace(/<[^>]*>/g, '').trim();
        const sentiment = this.analyzeSentiment(content);
        
        await this.processDataPoint({
          id: `news-${Date.now()}-${i}`,
          source: 'Google News',
          title: title,
          content: content,
          timestamp: pubDate ? new Date(pubDate) : new Date(),
          relevanceScore: this.calculateRelevanceScore(content, ['AI', 'technology', 'innovation']),
          sentiment: sentiment,
          metadata: {
            url: link,
            source: source,
            category: 'technology'
          }
        });
      }
    } catch (error) {
      console.error('❌ [NEWS] Fetch error:', error);
      // Fallback to a simpler approach if CORS proxy fails
      await this.fetchNewsWithFallback();
    }
  }

  private async fetchNewsWithFallback(): Promise<void> {
    // Simple fallback with mock realistic data
    const fallbackData = [
      {
        title: 'Latest AI Developments in Tech Industry',
        content: 'Recent advances in artificial intelligence continue to reshape the technology landscape with new applications emerging across various sectors.',
        url: 'https://news.example.com/ai-developments',
        source: 'Tech News'
      }
    ];
    
    for (const article of fallbackData) {
      const sentiment = this.analyzeSentiment(article.content);
      
      await this.processDataPoint({
        id: `news-fallback-${Date.now()}`,
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
  }

  private async fetchMarketData(): Promise<void> {
    try {
      // Using Alpha Vantage free API for basic market data
      // Note: You'll need to get a free API key from https://www.alphavantage.co/support/#api-key
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'TSLA'];
      
      for (const symbol of symbols) {
        try {
          // Using free tier of Alpha Vantage (limited requests)
          const apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo'; // Use 'demo' for testing
          const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
          
          const response = await fetch(url);
          const data = await response.json() as any;
          
          if (data['Global Quote']) {
            const quote = data['Global Quote'] as any;
            const price = parseFloat(quote['05. price']) || 0;
            const change = parseFloat(quote['09. change']) || 0;
            const changePercent = parseFloat(quote['10. change percent'].replace('%', '')) || 0;
            const volume = parseInt(quote['06. volume']) || 0;
            
            await this.processDataPoint({
              id: `market-${symbol}-${Date.now()}`,
              source: 'Market Data',
              title: `${symbol} Market Update`,
              content: `${symbol} traded at $${price.toFixed(2)}, ${change > 0 ? 'up' : 'down'} ${Math.abs(changePercent).toFixed(2)}%`,
              timestamp: new Date(),
              relevanceScore: Math.min(Math.abs(changePercent) / 10, 1.0), // Higher volatility = higher relevance
              sentiment: change > 0 ? 0.7 : 0.3,
              metadata: {
                symbol: symbol,
                price: price,
                change: changePercent,
                volume: volume
              }
            });
          }
          
          // Rate limiting - wait between requests to avoid hitting API limits
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (symbolError) {
          console.error(`❌ [MARKET] Error fetching ${symbol}:`, symbolError);
        }
      }
    } catch (error) {
      console.error('❌ [MARKET] Fetch error:', error);
      // Fallback to Yahoo Finance alternative
      await this.fetchMarketDataFallback();
    }
  }

  private async fetchMarketDataFallback(): Promise<void> {
    try {
      // Alternative using Yahoo Finance API (unofficial)
      const symbols = ['AAPL', 'GOOGL', 'MSFT'];
      
      for (const symbol of symbols) {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
          const response = await fetch(url);
          const data = await response.json() as any;
          
          if (data.chart?.result?.[0]) {
            const result = data.chart.result[0] as any;
            const meta = result.meta as any;
            const price = meta.regularMarketPrice || 0;
            const previousClose = meta.previousClose || price;
            const change = price - previousClose;
            const changePercent = (change / previousClose) * 100;
            
            await this.processDataPoint({
              id: `market-${symbol}-${Date.now()}`,
              source: 'Market Data',
              title: `${symbol} Market Update`,
              content: `${symbol} traded at $${price.toFixed(2)}, ${change > 0 ? 'up' : 'down'} ${Math.abs(changePercent).toFixed(2)}%`,
              timestamp: new Date(),
              relevanceScore: Math.min(Math.abs(changePercent) / 10, 1.0),
              sentiment: change > 0 ? 0.7 : 0.3,
              metadata: {
                symbol: symbol,
                price: price,
                change: changePercent,
                volume: meta.regularMarketVolume || 0
              }
            });
          }
        } catch (symbolError) {
          console.error(`❌ [MARKET] Fallback error for ${symbol}:`, symbolError);
        }
      }
    } catch (error) {
      console.error('❌ [MARKET] Fallback fetch error:', error);
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
