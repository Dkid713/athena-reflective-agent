
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
    // Simulate sentiment data - in production, integrate with actual APIs
    const simulatedData: SentimentData[] = [];
    
    switch (source) {
      case 'market_outlook':
        simulatedData.push({
          source: 'Market Outlook',
          text: 'Analysts remain optimistic about Q1 tech earnings despite recent volatility',
          sentiment: 0.65,
          confidence: 0.8,
          timestamp: new Date(),
          topics: ['earnings', 'technology', 'market']
        });
        break;
        
      case 'tech_sentiment':
        simulatedData.push({
          source: 'Tech Sentiment',
          text: 'AI adoption accelerating across enterprise sectors with positive reception',
          sentiment: 0.75,
          confidence: 0.85,
          timestamp: new Date(),
          topics: ['AI', 'enterprise', 'adoption']
        });
        break;
        
      case 'economic_indicators':
        simulatedData.push({
          source: 'Economic Indicators',
          text: 'Mixed signals from latest economic data suggest cautious optimism',
          sentiment: 0.55,
          confidence: 0.7,
          timestamp: new Date(),
          topics: ['economy', 'indicators', 'growth']
        });
        break;
        
      case 'social_media_trends':
        simulatedData.push({
          source: 'Social Media Trends',
          text: 'Public enthusiasm for new AI applications continues to grow',
          sentiment: 0.8,
          confidence: 0.75,
          timestamp: new Date(),
          topics: ['AI', 'public', 'enthusiasm']
        });
        break;
    }
    
    return simulatedData;
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
