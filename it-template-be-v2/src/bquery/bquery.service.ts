import { BigQuery } from '@google-cloud/bigquery';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class BqueryService implements OnModuleInit {
  private biqQueryClient: BigQuery;

  async onModuleInit() {
    this.biqQueryClient = new BigQuery({
      keyFilename: process.env.NODE_ENV !== 'production' && process.env.BQ_PATH,
      projectId: process.env.BQ_PROJECT_ID,
      location: process.env.BQ_LOCATION,
    });
  }

  async runQuery(query: any) {
    try {
      const [rows] = await this.biqQueryClient.query(query);
      return rows;
    } catch (error) {
      console.error('Error running big query:', error);
      throw error;
    }
  }

  // Health check method for BigQuery service
  async checkHealth(): Promise<boolean> {
    try {
      await this.biqQueryClient.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('BigQuery health check failed:', error);
      return false;
    }
  }
}
