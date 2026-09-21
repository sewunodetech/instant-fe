export interface TrendData {
  topics: string[];
  categories?: string[];
  hashtags?: string[];
  source?: string;
}

export interface TrendProviderInterface {
  getCurrentTrends(): Promise<TrendData>;
}
