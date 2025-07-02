import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { DatasetResult, SearchResult, ScrapingOptions } from './types';

export class QueryToDataset {
  private readonly SERPAPI_KEY: string;
  private readonly TRUSTED_DOMAINS = {
    statista: ['statista.com'],
    wikipedia: ['wikipedia.org'],
    government: ['.gov', '.edu'],
    industry: ['bloomberg.com', 'reuters.com', 'forbes.com']
  };

  constructor(serpApiKey: string) {
    this.SERPAPI_KEY = serpApiKey;
  }

  public async queryToDataset(query: string): Promise<DatasetResult> {
    const startTime = Date.now();

    // Validate query
    if (!this.isTabularQuery(query)) {
      throw new Error('Query does not appear to be requesting tabular data');
    }

    // Search for relevant pages
    const searchResults = await this.searchWeb(query);
    const bestResult = this.selectBestSource(searchResults);

    // Scrape the data
    const scrapingOptions = this.determineScrapingOptions(bestResult);
    const rawData = await this.scrapeData(bestResult.url, scrapingOptions);

    // Process and structure the data
    const processedData = this.processData(rawData, query);

    return {
      data: processedData,
      confidence: this.calculateConfidence(bestResult, processedData),
      sourceUrl: bestResult.url,
      metadata: {
        query,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      }
    };
  }

  private isTabularQuery(query: string): boolean {
    const tabularIndicators = [
      'list of',
      'top',
      'ranking',
      'statistics',
      'data',
      'numbers',
      'figures',
      'chart',
      'table'
    ];
    
    return tabularIndicators.some(indicator => 
      query.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  private async searchWeb(query: string): Promise<SearchResult[]> {
    // Implementation using SerpAPI
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        q: query,
        api_key: this.SERPAPI_KEY,
        engine: 'google'
      }
    });

    return response.data.organic_results.map((result: any) => ({
      url: result.link,
      title: result.title,
      snippet: result.snippet,
      sourceType: this.determineSourceType(result.link),
      trustScore: this.calculateTrustScore(result.link)
    }));
  }

  private determineSourceType(url: string): SearchResult['sourceType'] {
    const domain = new URL(url).hostname;
    
    for (const [type, domains] of Object.entries(this.TRUSTED_DOMAINS)) {
      if (domains.some(d => domain.includes(d))) {
        return type as SearchResult['sourceType'];
      }
    }
    
    return 'other';
  }

  private calculateTrustScore(url: string): number {
    const sourceType = this.determineSourceType(url);
    const baseScores = {
      statista: 0.9,
      wikipedia: 0.8,
      government: 0.85,
      industry: 0.75,
      other: 0.5
    };
    
    return baseScores[sourceType];
  }

  private selectBestSource(results: SearchResult[]): SearchResult {
    return results.reduce((best, current) => 
      current.trustScore > best.trustScore ? current : best
    );
  }

  private determineScrapingOptions(result: SearchResult): ScrapingOptions {
    // Determine if we need Puppeteer based on the source
    const usePuppeteer = result.sourceType === 'statista' || 
                        result.sourceType === 'industry';
    
    return {
      usePuppeteer,
      waitForSelector: usePuppeteer ? 'table' : undefined,
      tableSelector: 'table',
      listSelector: 'ul, ol'
    };
  }

  private async scrapeData(url: string, options: ScrapingOptions): Promise<any> {
    if (options.usePuppeteer) {
      return this.scrapeWithPuppeteer(url, options);
    }
    return this.scrapeWithCheerio(url, options);
  }

  private async scrapeWithPuppeteer(url: string, options: ScrapingOptions): Promise<any> {
    const browser = await puppeteer.launch();
    try {
      const page = await browser.newPage();
      await page.goto(url);
      
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector);
      }

      const content = await page.content();
      return this.parseContent(content, options);
    } finally {
      await browser.close();
    }
  }

  private async scrapeWithCheerio(url: string, options: ScrapingOptions): Promise<any> {
    const response = await axios.get(url);
    return this.parseContent(response.data, options);
  }

  private parseContent(html: string, options: ScrapingOptions): any {
    const $ = cheerio.load(html);
    const data: any[] = [];

    // Try to find tables first
    if (options.tableSelector) {
      $(options.tableSelector).each((_, table) => {
        const tableData = this.parseTable($, table);
        if (tableData.length > 0) {
          data.push(...tableData);
        }
      });
    }

    // If no tables found, try lists
    if (data.length === 0 && options.listSelector) {
      $(options.listSelector).each((_, list) => {
        const listData = this.parseList($, list);
        if (listData.length > 0) {
          data.push(...listData);
        }
      });
    }

    return data;
  }

  private parseTable($: cheerio.CheerioAPI, table: cheerio.Element): any[] {
    const rows: any[] = [];
    const headers: string[] = [];

    $(table).find('tr').each((rowIndex, row) => {
      if (rowIndex === 0) {
        // Parse headers
        $(row).find('th, td').each((_, cell) => {
          headers.push($(cell).text().trim());
        });
      } else {
        // Parse data rows
        const rowData: any = {};
        $(row).find('td').each((colIndex, cell) => {
          if (headers[colIndex]) {
            rowData[headers[colIndex]] = $(cell).text().trim();
          }
        });
        if (Object.keys(rowData).length > 0) {
          rows.push(rowData);
        }
      }
    });

    return rows;
  }

  private parseList($: cheerio.CheerioAPI, list: cheerio.Element): any[] {
    const items: any[] = [];
    $(list).find('li').each((_, item) => {
      const text = $(item).text().trim();
      if (text) {
        items.push({ value: text });
      }
    });
    return items;
  }

  private processData(rawData: any[], query: string): any[] {
    // Basic data cleaning and standardization
    return rawData.map(item => {
      const processed: any = {};
      
      // Convert all keys to lowercase and remove special characters
      Object.entries(item).forEach(([key, value]) => {
        const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_');
        processed[cleanKey] = value;
      });

      return processed;
    });
  }

  private calculateConfidence(result: SearchResult, data: any[]): number {
    const baseConfidence = result.trustScore;
    const dataQualityScore = Math.min(data.length / 10, 1); // Cap at 1.0
    return (baseConfidence + dataQualityScore) / 2;
  }
} 