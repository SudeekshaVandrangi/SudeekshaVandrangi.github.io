export interface DatasetResult {
  data: any[];
  confidence: number;
  sourceUrl: string;
  metadata: {
    query: string;
    timestamp: string;
    processingTime: number;
  };
}

export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  sourceType: 'statista' | 'wikipedia' | 'government' | 'industry' | 'other';
  trustScore: number;
}

export interface ScrapingOptions {
  usePuppeteer: boolean;
  waitForSelector?: string;
  tableSelector?: string;
  listSelector?: string;
} 