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
        id: 'hacker_news',
        name: 'Hacker News',
        type: 'news',
        url: 'https://hacker-news.firebaseio.com/v0',
        isActive: true
      },
      {
        id: 'reddit_programming',
        name: 'Reddit Programming',
        type: 'news',
        url: 'https://www.reddit.com/r/programming.json',
        isActive: true
      },
      {
        id: 'github_trending',
        name: 'GitHub Trending',
        type: 'academic',
        url: 'https://api.github.com/search/repositories',
        isActive: true
      },
      {
        id: 'crypto_prices',
        name: 'Cryptocurrency Data',
        type: 'market',
        url: 'https://api.coingecko.com/api/v3',
        isActive: true
      }
    ];

    sources.forEach(source => {
      this.feedSources.set(source.id, source);
      this.lastFetchTimes.set(source.id, new Date(0));
    });
  }

  async startDataIngestion(): Promise<void> {
    console.log('🌐 [DATA FEED] Starting real data ingestion...');

    // Run initial fetch
    await this.fetchAllFeeds();

    // Set up periodic fetching
    setInterval(async () => {
      await this.fetchAllFeeds();
    }, 2 * 60 * 1000); // Every 2 minutes
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
      case 'hacker_news':
        await this.fetchHackerNewsData();
        break;
      case 'reddit_programming':
        await this.fetchRedditData();
        break;
      case 'github_trending':
        await this.fetchGitHubTrendingData();
        break;
      case 'crypto_prices':
        await this.fetchCryptoPriceData();
        break;
    }

    this.lastFetchTimes.set(sourceId, new Date());
  }

  private async fetchHackerNewsData(): Promise<void> {
    try {
      // Get top stories
      const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const topStories = await topStoriesResponse.json() as number[];

      // Get first 5 stories
      const storyPromises = topStories.slice(0, 5).map(async (id) => {
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return storyResponse.json();
      });

      const stories = await Promise.all(storyPromises);

      for (const story of stories) {
        if (story && story.title) {
          await this.processDataPoint({
            id: `hn-${story.id}`,
            source: 'Hacker News',
            title: story.title,
            content: story.text || story.url || 'No content available',
            timestamp: new Date(story.time * 1000),
            relevanceScore: this.calculateRelevanceScore(story.title, ['AI', 'programming', 'technology', 'startup']),
            metadata: {
              url: story.url,
              score: story.score,
              comments: story.descendants || 0,
              author: story.by
            }
          });
        }
      }
    } catch (error) {
      console.error('❌ [HACKER NEWS] Fetch error:', error);
    }
  }

  private async fetchRedditData(): Promise<void> {
    try {
      const response = await fetch('https://www.reddit.com/r/programming/hot.json?limit=5');
      const data = await response.json() as any;

      if (data.data?.children) {
        for (const post of data.data.children) {
          const postData = post.data;
          if (postData.title) {
            await this.processDataPoint({
              id: `reddit-${postData.id}`,
              source: 'Reddit Programming',
              title: postData.title,
              content: postData.selftext || postData.url || 'Link post',
              timestamp: new Date(postData.created_utc * 1000),
              relevanceScore: this.calculateRelevanceScore(postData.title, ['programming', 'code', 'developer', 'AI']),
              metadata: {
                url: `https://reddit.com${postData.permalink}`,
                score: postData.score,
                comments: postData.num_comments,
                author: postData.author,
                subreddit: postData.subreddit
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ [REDDIT] Fetch error:', error);
    }
  }

  private async fetchGitHubTrendingData(): Promise<void> {
    try {
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const dateString = lastWeek.toISOString().split('T')[0];

      const response = await fetch(
        `https://api.github.com/search/repositories?q=created:>${dateString}&sort=stars&order=desc&per_page=5`
      );
      const data = await response.json() as any;

      if (data.items) {
        for (const repo of data.items) {
          await this.processDataPoint({
            id: `github-${repo.id}`,
            source: 'GitHub Trending',
            title: `${repo.full_name}: ${repo.description || 'No description'}`,
            content: repo.description || 'No description available',
            timestamp: new Date(repo.created_at),
            relevanceScore: this.calculateRelevanceScore(
              `${repo.name} ${repo.description}`, 
              ['AI', 'machine learning', 'javascript', 'python', 'web']
            ),
            metadata: {
              url: repo.html_url,
              stars: repo.stargazers_count,
              language: repo.language,
              forks: repo.forks_count,
              owner: repo.owner.login
            }
          });
        }
      }
    } catch (error) {
      console.error('❌ [GITHUB] Fetch error:', error);
    }
  }

  private async fetchCryptoPriceData(): Promise<void> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true'
      );
      const data = await response.json() as any;

      for (const [coinId, priceData] of Object.entries(data)) {
        const price = (priceData as any).usd;
        const change24h = (priceData as any).usd_24h_change;

        await this.processDataPoint({
          id: `crypto-${coinId}-${Date.now()}`,
          source: 'Cryptocurrency',
          title: `${coinId.toUpperCase()} Price Update`,
          content: `${coinId} is trading at $${price.toFixed(2)}, ${change24h > 0 ? 'up' : 'down'} ${Math.abs(change24h).toFixed(2)}% in 24h`,
          timestamp: new Date(),
          relevanceScore: Math.min(Math.abs(change24h) / 10, 1.0),
          sentiment: change24h > 0 ? 0.7 : 0.3,
          metadata: {
            coin: coinId,
            price: price,
            change24h: change24h,
            symbol: coinId.substring(0, 3).toUpperCase()
          }
        });
      }
    } catch (error) {
      console.error('❌ [CRYPTO] Fetch error:', error);
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
      score += matches * 0.2;
    });

    return Math.min(score, 1.0);
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