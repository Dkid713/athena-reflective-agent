
import { AthenaReflector, MemoryNode } from './AthenaReflector';

export interface SentimentData {
  source: string;
  text: string;
  sentiment: number;
  confidence: number;
  timestamp: Date;
  topics: string[];
}

export class OutlookSentimentEngine {
  private reflector?: AthenaReflector;
  private sentimentHistory: Map<string, SentimentData[]> = new Map();

  setReflector(reflector: AthenaReflector): void {
    this.reflector = reflector;
  }

  async startSentimentAnalysis(): Promise<void> {
    console.log('💭 [SENTIMENT] Starting Outlook sentiment analysis...');
    
    // Simulate periodic sentiment analysis
    setInterval(async () => {
      await this.analyzeSentimentTrends();
    }, 3 * 60 * 1000); // Every 3 minutes
  }

  private async analyzeSentimentTrends(): Promise<void> {
    // Simulate getting sentiment data from various sources
    const sentimentSources = [
      'market_outlook',
      'tech_sentiment', 
      'economic_indicators',
      'social_media_trends'
    ];

    for (const source of sentimentSources) {
      const sentimentData = await this.fetchSentimentData(source);
      await this.processSentimentData(sentimentData);
    }

    // Analyze trends and create reflections
    await this.generateSentimentReflections();
  }

  private async fetchSentimentData(source: string): Promise<SentimentData[]> {
    const sentimentData: SentimentData[] = [];
    
    try {
      switch (source) {
        case 'market_outlook':
          await this.fetchMarketSentiment(sentimentData);
          break;
          
        case 'tech_sentiment':
          await this.fetchTechSentiment(sentimentData);
          break;
          
        case 'economic_indicators':
          await this.fetchEconomicSentiment(sentimentData);
          break;
          
        case 'social_media_trends':
          await this.fetchSocialMediaSentiment(sentimentData);
          break;
      }
    } catch (error) {
      console.error(`❌ [SENTIMENT] Error fetching ${source}:`, error);
    }
    
    return sentimentData;
  }

  private async fetchMarketSentiment(sentimentData: SentimentData[]): Promise<void> {
    try {
      // Fetch recent financial news for sentiment analysis
      const newsUrl = 'https://news.google.com/rss/search?q=stock+market+outlook+earnings&hl=en&gl=US&ceid=US:en';
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(newsUrl)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const xmlText = data.contents;
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const items = xmlDoc.getElementsByTagName('item');
      
      if (items.length > 0) {
        const item = items[0]; // Take the most recent article
        const title = item.getElementsByTagName('title')[0]?.textContent || '';
        const description = item.getElementsByTagName('description')[0]?.textContent || '';
        const content = (title + ' ' + description.replace(/<[^>]*>/g, '')).trim();
        
        const sentiment = this.analyzeSentimentScore(content);
        
        sentimentData.push({
          source: 'Market Outlook',
          text: content.substring(0, 200) + '...',
          sentiment: sentiment,
          confidence: 0.8,
          timestamp: new Date(),
          topics: this.extractTopics(content, ['earnings', 'market', 'stocks', 'outlook'])
        });
      }
    } catch (error) {
      // Fallback with neutral sentiment
      sentimentData.push({
        source: 'Market Outlook',
        text: 'Market sentiment data temporarily unavailable',
        sentiment: 0.5,
        confidence: 0.5,
        timestamp: new Date(),
        topics: ['market']
      });
    }
  }

  private async fetchTechSentiment(sentimentData: SentimentData[]): Promise<void> {
    try {
      // Fetch tech news for sentiment analysis
      const newsUrl = 'https://news.google.com/rss/search?q=artificial+intelligence+technology+adoption&hl=en&gl=US&ceid=US:en';
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(newsUrl)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const xmlText = data.contents;
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const items = xmlDoc.getElementsByTagName('item');
      
      if (items.length > 0) {
        const item = items[0];
        const title = item.getElementsByTagName('title')[0]?.textContent || '';
        const description = item.getElementsByTagName('description')[0]?.textContent || '';
        const content = (title + ' ' + description.replace(/<[^>]*>/g, '')).trim();
        
        const sentiment = this.analyzeSentimentScore(content);
        
        sentimentData.push({
          source: 'Tech Sentiment',
          text: content.substring(0, 200) + '...',
          sentiment: sentiment,
          confidence: 0.85,
          timestamp: new Date(),
          topics: this.extractTopics(content, ['AI', 'technology', 'innovation', 'adoption'])
        });
      }
    } catch (error) {
      sentimentData.push({
        source: 'Tech Sentiment',
        text: 'Technology sentiment data temporarily unavailable',
        sentiment: 0.6,
        confidence: 0.5,
        timestamp: new Date(),
        topics: ['technology']
      });
    }
  }

  private async fetchEconomicSentiment(sentimentData: SentimentData[]): Promise<void> {
    try {
      // Fetch economic news for sentiment analysis
      const newsUrl = 'https://news.google.com/rss/search?q=economic+indicators+GDP+inflation&hl=en&gl=US&ceid=US:en';
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(newsUrl)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json() as any;
      const xmlText = data.contents;
      
      const { DOMParser } = await import('xmldom');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const items = xmlDoc.getElementsByTagName('item');
      
      if (items.length > 0) {
        const item = items[0];
        const title = item.getElementsByTagName('title')[0]?.textContent || '';
        const description = item.getElementsByTagName('description')[0]?.textContent || '';
        const content = (title + ' ' + description.replace(/<[^>]*>/g, '')).trim();
        
        const sentiment = this.analyzeSentimentScore(content);
        
        sentimentData.push({
          source: 'Economic Indicators',
          text: content.substring(0, 200) + '...',
          sentiment: sentiment,
          confidence: 0.7,
          timestamp: new Date(),
          topics: this.extractTopics(content, ['economy', 'GDP', 'inflation', 'growth'])
        });
      }
    } catch (error) {
      sentimentData.push({
        source: 'Economic Indicators',
        text: 'Economic sentiment data temporarily unavailable',
        sentiment: 0.5,
        confidence: 0.5,
        timestamp: new Date(),
        topics: ['economy']
      });
    }
  }

  private async fetchSocialMediaSentiment(sentimentData: SentimentData[]): Promise<void> {
    // Social media sentiment would typically require API keys for Twitter, Reddit, etc.
    // For now, we'll use tech news as a proxy for public sentiment
    try {
      const newsUrl = 'https://news.google.com/rss/search?q=public+opinion+AI+technology&hl=en&gl=US&ceid=US:en';
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(newsUrl)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const xmlText = data.contents;
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const items = xmlDoc.getElementsByTagName('item');
      
      if (items.length > 0) {
        const item = items[0];
        const title = item.getElementsByTagName('title')[0]?.textContent || '';
        const description = item.getElementsByTagName('description')[0]?.textContent || '';
        const content = (title + ' ' + description.replace(/<[^>]*>/g, '')).trim();
        
        const sentiment = this.analyzeSentimentScore(content);
        
        sentimentData.push({
          source: 'Social Media Trends',
          text: content.substring(0, 200) + '...',
          sentiment: sentiment,
          confidence: 0.75,
          timestamp: new Date(),
          topics: this.extractTopics(content, ['public', 'opinion', 'social', 'trends'])
        });
      }
    } catch (error) {
      sentimentData.push({
        source: 'Social Media Trends',
        text: 'Social media sentiment data temporarily unavailable',
        sentiment: 0.6,
        confidence: 0.5,
        timestamp: new Date(),
        topics: ['social']
      });
    }
  }

  private analyzeSentimentScore(text: string): number {
    const positiveWords = ['positive', 'good', 'great', 'excellent', 'success', 'growth', 'gain', 'rise', 'improve', 'strong', 'bullish', 'optimistic'];
    const negativeWords = ['negative', 'bad', 'poor', 'decline', 'fall', 'drop', 'weak', 'bearish', 'pessimistic', 'concern', 'risk', 'crisis'];
    
    const textLower = text.toLowerCase();
    let score = 0.5; // neutral baseline
    
    positiveWords.forEach(word => {
      const matches = (textLower.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      score += matches * 0.05;
    });
    
    negativeWords.forEach(word => {
      const matches = (textLower.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      score -= matches * 0.05;
    });
    
    return Math.max(0, Math.min(1, score));
  }

  private extractTopics(text: string, possibleTopics: string[]): string[] {
    const textLower = text.toLowerCase();
    return possibleTopics.filter(topic => 
      textLower.includes(topic.toLowerCase())
    );
  }

  private async processSentimentData(sentimentDataList: SentimentData[]): Promise<void> {
    for (const data of sentimentDataList) {
      // Store in history
      if (!this.sentimentHistory.has(data.source)) {
        this.sentimentHistory.set(data.source, []);
      }
      
      const history = this.sentimentHistory.get(data.source)!;
      history.push(data);
      
      // Keep only last 100 entries per source
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }

      // Create memory node
      if (this.reflector) {
        const memoryNode: MemoryNode = {
          id: `sentiment-${data.source}-${Date.now()}`,
          type: 'observation',
          content: `Sentiment from ${data.source}: ${data.text} (Score: ${data.sentiment.toFixed(2)})`,
          createdAt: data.timestamp,
          scope: 'global',
          tags: [
            'sentiment-analysis',
            data.source.toLowerCase().replace(/\s+/g, '-'),
            data.sentiment > 0.6 ? 'positive' : data.sentiment < 0.4 ? 'negative' : 'neutral',
            ...data.topics.map(topic => `topic-${topic.toLowerCase()}`)
          ],
          confidence: data.confidence,
          links: []
        };

        this.reflector.storeMemory(memoryNode);
      }
    }
  }

  private async generateSentimentReflections(): Promise<void> {
    if (!this.reflector) return;

    // Analyze overall sentiment trends
    const overallSentiment = this.calculateOverallSentiment();
    const sentimentTrend = this.calculateSentimentTrend();

    // Generate reflection based on sentiment analysis
    const reflection: MemoryNode = {
      id: `sentiment-reflection-${Date.now()}`,
      type: 'retrieved',
      content: `Market sentiment analysis: Overall sentiment is ${this.describeSentiment(overallSentiment)} (${overallSentiment.toFixed(2)}). Trend is ${sentimentTrend > 0 ? 'improving' : sentimentTrend < 0 ? 'declining' : 'stable'}.`,
      createdAt: new Date(),
      scope: 'global',
      tags: [
        'sentiment-reflection',
        'market-analysis',
        overallSentiment > 0.6 ? 'bullish' : overallSentiment < 0.4 ? 'bearish' : 'neutral',
        'outlook-analysis'
      ],
      confidence: 0.8,
      links: []
    };

    this.reflector.storeMemory(reflection);
    console.log(`💭 [SENTIMENT] Generated reflection: ${reflection.content}`);
  }

  private calculateOverallSentiment(): number {
    let totalSentiment = 0;
    let totalWeight = 0;

    for (const [source, dataList] of this.sentimentHistory) {
      // Use recent data (last 5 entries)
      const recentData = dataList.slice(-5);
      const sourceWeight = this.getSourceWeight(source);

      recentData.forEach(data => {
        totalSentiment += data.sentiment * data.confidence * sourceWeight;
        totalWeight += data.confidence * sourceWeight;
      });
    }

    return totalWeight > 0 ? totalSentiment / totalWeight : 0.5;
  }

  private calculateSentimentTrend(): number {
    const trendsPerSource: number[] = [];

    for (const [source, dataList] of this.sentimentHistory) {
      if (dataList.length < 2) continue;

      const recent = dataList.slice(-3);
      const older = dataList.slice(-6, -3);

      if (recent.length === 0 || older.length === 0) continue;

      const recentAvg = recent.reduce((sum, d) => sum + d.sentiment, 0) / recent.length;
      const olderAvg = older.reduce((sum, d) => sum + d.sentiment, 0) / older.length;

      trendsPerSource.push(recentAvg - olderAvg);
    }

    return trendsPerSource.length > 0 
      ? trendsPerSource.reduce((sum, trend) => sum + trend, 0) / trendsPerSource.length
      : 0;
  }

  private getSourceWeight(source: string): number {
    const weights: { [key: string]: number } = {
      'Market Outlook': 1.0,
      'Tech Sentiment': 0.8,
      'Economic Indicators': 1.2,
      'Social Media Trends': 0.6
    };
    
    return weights[source] || 0.5;
  }

  private describeSentiment(sentiment: number): string {
    if (sentiment > 0.7) return 'very positive';
    if (sentiment > 0.6) return 'positive';
    if (sentiment > 0.4) return 'neutral';
    if (sentiment > 0.3) return 'negative';
    return 'very negative';
  }

  getSentimentSummary(): { [source: string]: { current: number; trend: string; dataPoints: number } } {
    const summary: { [source: string]: { current: number; trend: string; dataPoints: number } } = {};

    for (const [source, dataList] of this.sentimentHistory) {
      if (dataList.length === 0) continue;

      const current = dataList[dataList.length - 1].sentiment;
      const trend = dataList.length > 1 
        ? dataList[dataList.length - 1].sentiment - dataList[dataList.length - 2].sentiment
        : 0;

      summary[source] = {
        current: current,
        trend: trend > 0.05 ? 'up' : trend < -0.05 ? 'down' : 'stable',
        dataPoints: dataList.length
      };
    }

    return summary;
  }
}
