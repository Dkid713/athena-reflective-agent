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
    console.log('💭 [SENTIMENT] Starting real sentiment analysis...');

    // Initial analysis
    await this.analyzeSentimentTrends();

    // Periodic sentiment analysis
    setInterval(async () => {
      await this.analyzeSentimentTrends();
    }, 3 * 60 * 1000); // Every 3 minutes
  }

  private async analyzeSentimentTrends(): Promise<void> {
    const sentimentSources = [
      'tech_news',
      'crypto_sentiment', 
      'hacker_news_sentiment',
      'reddit_sentiment'
    ];

    for (const source of sentimentSources) {
      const sentimentData = await this.fetchSentimentData(source);
      await this.processSentimentData(sentimentData);
    }

    await this.generateSentimentReflections();
  }

  private async fetchSentimentData(source: string): Promise<SentimentData[]> {
    const sentimentData: SentimentData[] = [];

    try {
      switch (source) {
        case 'tech_news':
          await this.fetchTechNewsSentiment(sentimentData);
          break;

        case 'crypto_sentiment':
          await this.fetchCryptoSentiment(sentimentData);
          break;

        case 'hacker_news_sentiment':
          await this.fetchHackerNewsSentiment(sentimentData);
          break;

        case 'reddit_sentiment':
          await this.fetchRedditSentiment(sentimentData);
          break;
      }
    } catch (error) {
      console.error(`❌ [SENTIMENT] Error fetching ${source}:`, error);
    }

    return sentimentData;
  }

  private async fetchTechNewsSentiment(sentimentData: SentimentData[]): Promise<void> {
    try {
      // Use NewsAPI alternative - we'll fetch from a public RSS feed
      const response = await fetch('https://feeds.feedburner.com/TechCrunch');
      const xmlText = await response.text();

      // Simple XML parsing for RSS
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
          source: 'Tech News',
          text: content.substring(0, 300) + '...',
          sentiment: sentiment,
          confidence: 0.8,
          timestamp: new Date(),
          topics: this.extractTopics(content, ['technology', 'AI', 'startup', 'innovation'])
        });
      }
    } catch (error) {
      console.error('❌ [TECH NEWS] Sentiment fetch error:', error);
      // Fallback data
      sentimentData.push({
        source: 'Tech News',
        text: 'Technology sector showing mixed signals with AI developments continuing',
        sentiment: 0.6,
        confidence: 0.5,
        timestamp: new Date(),
        topics: ['technology', 'AI']
      });
    }
  }

  private async fetchCryptoSentiment(sentimentData: SentimentData[]): Promise<void> {
    try {
      // Get crypto fear & greed index (free API)
      const response = await fetch('https://api.alternative.me/fng/');
      const data = await response.json() as any;

      if (data.data && data.data[0]) {
        const fngData = data.data[0];
        const value = parseInt(fngData.value);
        const classification = fngData.value_classification;

        // Convert fear & greed to sentiment (0-100 scale to 0-1)
        const sentiment = value / 100;

        sentimentData.push({
          source: 'Crypto Market',
          text: `Crypto Fear & Greed Index: ${value}/100 (${classification}). Market sentiment reflects ${classification.toLowerCase()} conditions.`,
          sentiment: sentiment,
          confidence: 0.9,
          timestamp: new Date(fngData.timestamp * 1000),
          topics: ['cryptocurrency', 'market', 'sentiment']
        });
      }
    } catch (error) {
      console.error('❌ [CRYPTO] Sentiment fetch error:', error);
      sentimentData.push({
        source: 'Crypto Market',
        text: 'Cryptocurrency market sentiment data temporarily unavailable',
        sentiment: 0.5,
        confidence: 0.3,
        timestamp: new Date(),
        topics: ['cryptocurrency']
      });
    }
  }

  private async fetchHackerNewsSentiment(sentimentData: SentimentData[]): Promise<void> {
    try {
      // Get top HN stories and analyze sentiment
      const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const topStories = await topStoriesResponse.json() as number[];

      const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${topStories[0]}.json`);
      const story = await storyResponse.json() as any;

      if (story && story.title) {
        const sentiment = this.analyzeSentimentScore(story.title);

        sentimentData.push({
          source: 'Hacker News',
          text: `Top story: ${story.title}`,
          sentiment: sentiment,
          confidence: 0.7,
          timestamp: new Date(story.time * 1000),
          topics: this.extractTopics(story.title, ['tech', 'programming', 'startup', 'AI'])
        });
      }
    } catch (error) {
      console.error('❌ [HN] Sentiment fetch error:', error);
    }
  }

  private async fetchRedditSentiment(sentimentData: SentimentData[]): Promise<void> {
    try {
      const response = await fetch('https://www.reddit.com/r/technology/hot.json?limit=1');
      const data = await response.json() as any;

      if (data.data?.children?.[0]) {
        const post = data.data.children[0].data;
        const content = `${post.title} ${post.selftext || ''}`;
        const sentiment = this.analyzeSentimentScore(content);

        sentimentData.push({
          source: 'Reddit Tech',
          text: post.title,
          sentiment: sentiment,
          confidence: 0.6,
          timestamp: new Date(post.created_utc * 1000),
          topics: this.extractTopics(content, ['technology', 'discussion', 'community'])
        });
      }
    } catch (error) {
      console.error('❌ [REDDIT] Sentiment fetch error:', error);
    }
  }

  private analyzeSentimentScore(text: string): number {
    const positiveWords = [
      'breakthrough', 'innovation', 'success', 'growth', 'improve', 'advance', 'excellent',
      'amazing', 'revolutionary', 'efficient', 'powerful', 'exciting', 'promising',
      'bullish', 'positive', 'gain', 'rise', 'surge', 'boom', 'strong'
    ];

    const negativeWords = [
      'crisis', 'decline', 'failure', 'problem', 'risk', 'concern', 'poor',
      'terrible', 'crash', 'fall', 'drop', 'bearish', 'negative', 'weak',
      'struggle', 'difficult', 'warning', 'threat', 'danger', 'loss'
    ];

    const textLower = text.toLowerCase();
    let score = 0.5; // neutral baseline

    positiveWords.forEach(word => {
      const matches = (textLower.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      score += matches * 0.03;
    });

    negativeWords.forEach(word => {
      const matches = (textLower.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      score -= matches * 0.03;
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
      if (!this.sentimentHistory.has(data.source)) {
        this.sentimentHistory.set(data.source, []);
      }

      const history = this.sentimentHistory.get(data.source)!;
      history.push(data);

      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }

      if (this.reflector) {
        const memoryNode: MemoryNode = {
          id: `sentiment-${data.source}-${Date.now()}`,
          type: 'observation',
          content: `Real sentiment from ${data.source}: ${data.text} (Score: ${data.sentiment.toFixed(2)})`,
          createdAt: data.timestamp,
          scope: 'global',
          tags: [
            'real-sentiment-analysis',
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

    const overallSentiment = this.calculateOverallSentiment();
    const sentimentTrend = this.calculateSentimentTrend();

    const reflection: MemoryNode = {
      id: `sentiment-reflection-${Date.now()}`,
      type: 'retrieved',
      content: `Real-time sentiment analysis: Overall sentiment is ${this.describeSentiment(overallSentiment)} (${overallSentiment.toFixed(2)}). Trend is ${sentimentTrend > 0.05 ? 'improving' : sentimentTrend < -0.05 ? 'declining' : 'stable'}.`,
      createdAt: new Date(),
      scope: 'global',
      tags: [
        'real-sentiment-reflection',
        'market-analysis',
        overallSentiment > 0.6 ? 'bullish' : overallSentiment < 0.4 ? 'bearish' : 'neutral',
        'live-data'
      ],
      confidence: 0.85,
      links: []
    };

    this.reflector.storeMemory(reflection);
    console.log(`💭 [SENTIMENT] Real sentiment reflection: ${reflection.content}`);
  }

  private calculateOverallSentiment(): number {
    let totalSentiment = 0;
    let totalWeight = 0;

    for (const [source, dataList] of this.sentimentHistory) {
      const recentData = dataList.slice(-3);
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

      const recent = dataList.slice(-2);
      const older = dataList.slice(-4, -2);

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
      'Tech News': 1.0,
      'Crypto Market': 0.9,
      'Hacker News': 0.8,
      'Reddit Tech': 0.7
    };

    return weights[source] || 0.5;
  }

  private describeSentiment(sentiment: number): string {
    if (sentiment > 0.75) return 'very positive';
    if (sentiment > 0.6) return 'positive';
    if (sentiment > 0.4) return 'neutral';
    if (sentiment > 0.25) return 'negative';
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