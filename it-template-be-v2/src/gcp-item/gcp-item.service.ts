import { Injectable } from '@nestjs/common';
import { SearchGcpItemDto } from './dto/search-gcp-item.dto';
import { BigQuery } from '@google-cloud/bigquery';

@Injectable()
export class GcpItemService {
  private bigquery = new BigQuery({
    keyFilename: process.env.BIGQUERY_GCP_PATH,
    projectId: process.env.BIGQUERY_GCP_PROJECT_ID,
    // projectId: 'ptpl-land-prd',
  });

  constructor() {}

  // ======================================
  //  BIGQUERY SECTION
  // ======================================

  async runQuery(sql: string): Promise<any[]> {
    const [rows] = await this.bigquery.query({ query: sql });
    return rows;
  }

  async getDatasets(): Promise<{ results: string[] }> {
    try {
      const [datasets] = await this.bigquery.getDatasets();
      const datasetNames = datasets.map((dataset) => dataset.id);
      return { results: datasetNames };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getDatasetsWithMetadata(): Promise<{ results: any[] }> {
    try {
      const [datasets] = await this.bigquery.getDatasets();

      const datasetMetadata = await Promise.all(
        datasets.map(async (dataset) => {
          const [metadata] = await dataset.getMetadata();
          const [tables] = await dataset.getTables();
          return {
            id: dataset.id,
            description: metadata.description,
            lastModifiedTime: metadata.lastModifiedTime
              ? new Date(parseInt(metadata.lastModifiedTime)).toISOString()
              : null,
            tableCount: tables.length || 0,
            datasetType: metadata.type || '',
            kind: metadata.kind || 0,
          };
        })
      );

      return { results: datasetMetadata };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTablesFromDataset(datasetId: string): Promise<{ results: string[] }> {
    try {
      const dataset = this.bigquery.dataset(datasetId);
      const [tables] = await dataset.getTables();
      const tableNames = tables.map((table) => table.id);
      return { results: tableNames };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTablesFromDatasetWithMetadata(
    datasetId: string
  ): Promise<{ results: { tableName: string; description?: string }[] }> {
    try {
      const dataset = this.bigquery.dataset(datasetId);
      const [tables] = await dataset.getTables();

      const results = await Promise.all(
        tables.map(async (table) => {
          const [metadata] = await table.getMetadata();
          return {
            tableName: table.id,
            lastModifiedTime: metadata.lastModifiedTime
              ? new Date(parseInt(metadata.lastModifiedTime)).toISOString()
              : null,
            rowCount: metadata.numRows || 0,
            tableType: metadata.type || '',
            sizeBytes: metadata.numBytes || 0,
          };
        })
      );

      return { results };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getFieldsFromTable(datasetId: string, tableName: string): Promise<{ results: string[] }> {
    try {
      const dataset = this.bigquery.dataset(datasetId);
      const table = dataset.table(tableName);

      // Get the metadata of the table
      const [metadata] = await table.getMetadata();

      // Extract the schema and fields (columns)

      return { results: metadata };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getDatasFromTable(datasetId: string, tableName: string): Promise<{ results: any[] }> {
    try {
      const dataset = this.bigquery.dataset(datasetId);
      const table = dataset.table(tableName);

      // Fetch all rows from the table
      const [rows] = await table.getRows();

      return { results: rows };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getDatasFromTableWithCustomQuery(
    searchGcpItemDto: SearchGcpItemDto
  ): Promise<{ results: any[]; count: number }> {
    try {
      const { datasetId, tableId, headerList, skip, take, where, orderBy } = searchGcpItemDto;

      const selectedColumns = headerList && headerList.length > 0 ? headerList.join(', ') : '*';
      let query = `SELECT ${selectedColumns} FROM \`${datasetId}.${tableId}\``;

      let whereClause = '';
      if (where && Object.keys(where).length > 0) {
        const whereClauses = Object.entries(where)
          .map(([key, value]) =>
            typeof value === 'string' ? `\`${key}\` = '${value}'` : `\`${key}\` = ${value}`
          )
          .join(' OR ');

        whereClause = ` WHERE ${whereClauses}`;
        query += whereClause;
      }

      if (orderBy) {
        query += ` ORDER BY ${orderBy}`;
      }

      if (take !== undefined && skip !== undefined) {
        query += ` LIMIT ${take} OFFSET ${skip}`;
      }

      const options = {
        query,
        location: 'asia-southeast2',
      };

      const [job] = await this.bigquery.createQueryJob(options);
      const [rows] = await job.getQueryResults();

      // Query for total count including the same WHERE condition
      const countQuery = `SELECT COUNT(*) as totalCount FROM \`${datasetId}.${tableId}\`${whereClause}`;
      const countOptions = {
        query: countQuery,
        location: 'asia-southeast2',
      };

      const [countJob] = await this.bigquery.createQueryJob(countOptions);
      const [countRows] = await countJob.getQueryResults();
      const totalCount = countRows[0].totalCount;

      return { results: rows, count: totalCount };
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  async getCustomNetProfit(): Promise<{ results: any[]; count: number }> {
    try {
      const query = `WITH params AS (
  SELECT
    EXTRACT(YEAR FROM CURRENT_DATE()) AS current_year,
    (SELECT MAX(DATE_TRUNC(DATE(PERIODE), MONTH))
     FROM ptpl-curated-prd.DATAMART_DASHBOARD.EXECUTIVE_SUMMARY
     WHERE EXTRACT(YEAR FROM PERIODE) = EXTRACT(YEAR FROM CURRENT_DATE())
    ) AS cutoff_month
),

monthly AS (
  SELECT
    DATE_TRUNC(DATE(PERIODE), MONTH) AS PERIODE_MONTH,
    EXTRACT(YEAR FROM PERIODE) AS YEAR,
    SUM(REALISASI_NET_PROFIT) AS sum_realisasi_net_profit,
    SUM(RKAP_NET_PROFIT) AS sum_rkap_net_profit,
    SUM(REALISASI_VOLUME) AS sum_realisasi_volume,
    SUM(RKAP_VOLUME) AS sum_rkap_volume,
    SUM(REALISASI_REVENUE) AS sum_realisasi_revenue,
    SUM(RKAP_REVENUE) AS sum_rkap_revenue,
    SUM(REALISASI_EBITDA) AS sum_realisasi_ebitda,
    SUM(RKAP_EBITDA) AS sum_rkap_ebitda,
    SUM(REALISASI_COGS) AS sum_realisasi_cogs,
    SUM(RKAP_COGS) AS sum_rkap_cogs
  FROM ptpl-curated-prd.DATAMART_DASHBOARD.EXECUTIVE_SUMMARY, params
  WHERE DATE_TRUNC(DATE(PERIODE), MONTH) <= params.cutoff_month
  GROUP BY 1,2
),

ytd AS (
  SELECT
    YEAR,
    PERIODE_MONTH,
    SUM(sum_realisasi_net_profit) OVER (PARTITION BY YEAR ORDER BY PERIODE_MONTH) AS executive_summary_sum_realisasi_net_profit,
    SUM(sum_rkap_net_profit) OVER (PARTITION BY YEAR ORDER BY PERIODE_MONTH) AS executive_summary_sum_rkap_net_profit,
    SUM(sum_realisasi_volume) OVER (PARTITION BY YEAR ORDER BY PERIODE_MONTH) AS executive_summary_sum_realisasi_volume,
    SUM(sum_rkap_volume) OVER (PARTITION BY YEAR ORDER BY PERIODE_MONTH) AS executive_summary_sum_rkap_volume,
    SUM(sum_realisasi_revenue) OVER (PARTITION BY YEAR ORDER BY PERIODE_MONTH) AS executive_summary_sum_realisasi_revenue,
    SUM(sum_rkap_revenue) OVER (PARTITION BY YEAR ORDER BY PERIODE_MONTH) AS executive_summary_sum_rkap_revenue,
    SUM(sum_realisasi_ebitda) OVER (PARTITION BY YEAR ORDER BY PERIODE_MONTH) AS executive_summary_sum_realisasi_ebitda,
    SUM(sum_rkap_ebitda) OVER (PARTITION BY YEAR ORDER BY PERIODE_MONTH) AS executive_summary_sum_rkap_ebitda,
    SUM(sum_realisasi_cogs) OVER (PARTITION BY YEAR ORDER BY PERIODE_MONTH) AS executive_summary_sum_realisasi_cogs,
    SUM(sum_rkap_cogs) OVER (PARTITION BY YEAR ORDER BY PERIODE_MONTH) AS executive_summary_sum_rkap_cogs
  FROM monthly
)

SELECT
  YEAR,
  PERIODE_MONTH,
  executive_summary_sum_realisasi_net_profit,
  executive_summary_sum_rkap_net_profit,
  SAFE_DIVIDE(executive_summary_sum_realisasi_net_profit, executive_summary_sum_rkap_net_profit) AS executive_summary_percent_ach_net_profit,
  executive_summary_sum_realisasi_volume,
  executive_summary_sum_rkap_volume,
  SAFE_DIVIDE(executive_summary_sum_realisasi_volume, executive_summary_sum_rkap_volume) AS executive_summary_percent_ach_volume,
  executive_summary_sum_realisasi_revenue,
  executive_summary_sum_rkap_revenue,
  SAFE_DIVIDE(executive_summary_sum_realisasi_revenue, executive_summary_sum_rkap_revenue) AS executive_summary_percent_ach_revenue,
  executive_summary_sum_realisasi_ebitda,
  executive_summary_sum_rkap_ebitda,
  SAFE_DIVIDE(executive_summary_sum_realisasi_ebitda, executive_summary_sum_rkap_ebitda) AS executive_summary_percent_ach_ebitda,
  executive_summary_sum_realisasi_cogs,
  executive_summary_sum_rkap_cogs,
  SAFE_DIVIDE(executive_summary_sum_realisasi_cogs, executive_summary_sum_rkap_cogs) AS executive_summary_percent_ach_cogs
FROM ytd
ORDER BY YEAR, PERIODE_MONTH;`;

      const options = {
        query,
        location: 'asia-southeast2',
      };

      const [job] = await this.bigquery.createQueryJob(options);
      const [rows] = await job.getQueryResults();

      const normalized = rows.map((row) => ({
        PERIODE: row.PERIODE_MONTH?.value || row.PERIODE_MONTH, // flatten date field
        // volume
        // executive_summary_sum_realisasi_volume: Number(row.executive_summary_sum_realisasi_volume),
        // executive_summary_sum_rkap_volume: Number(row.executive_summary_sum_rkap_volume),
        executive_summary_percent_ach_volume: Number(row.executive_summary_percent_ach_volume || 0),
        // revenue
        // executive_summary_sum_realisasi_revenue: Number(
        //   row.executive_summary_sum_realisasi_revenue
        // ),
        // executive_summary_sum_rkap_revenue: Number(row.executive_summary_sum_rkap_revenue),
        executive_summary_percent_ach_revenue: Number(
          row.executive_summary_percent_ach_revenue || 0
        ),
        // cogs
        // executive_summary_sum_realisasi_cogs: Number(row.executive_summary_sum_realisasi_cogs),
        // executive_summary_sum_rkap_cogs: Number(row.executive_summary_sum_rkap_cogs),
        executive_summary_percent_ach_cogs: Number(row.executive_summary_percent_ach_cogs || 0),
        // net_profit
        // executive_summary_sum_realisasi_net_profit: Number(
        //   row.executive_summary_sum_realisasi_net_profit
        // ),
        // executive_summary_sum_rkap_net_profit: Number(row.executive_summary_sum_rkap_net_profit),
        executive_summary_percent_ach_net_profit: Number(
          row.executive_summary_percent_ach_net_profit || 0
        ),
        // ebitda
        // executive_summary_sum_realisasi_ebitda: Number(row.executive_summary_sum_realisasi_ebitda),
        // executive_summary_sum_rkap_ebitda: Number(row.executive_summary_sum_rkap_ebitda),
        executive_summary_percent_ach_ebitda: Number(row.executive_summary_percent_ach_ebitda || 0),
      }));

      const totalCount = normalized.length;

      return { results: normalized, count: totalCount };
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  // async create(createGcpItemDto: CreateGcpItemDto) {
  //   const { tagIds, ...rest } = createGcpItemDto;
  //   try {
  //     const data: Prisma.GcpItemUncheckedCreateInput = {
  //       ...rest,
  //       tags: {
  //         connect: tagIds.map((tag) => ({
  //           id: tag, // Connect existing tags by their ID
  //         })),
  //       },
  //     };

  //     return this.prisma.gcpItem.create({
  //       data,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }

  // async findAll(search: SearchGcpItemDto): Promise<{ results: GcpItem[]; count: number }> {
  //   const { skip, take, where, orderBy } = search;
  //   try {
  //     const results = await this.prisma.gcpItem.findMany({
  //       take,
  //       skip,
  //       where,
  //       orderBy,
  //       include: {
  //         Author: { select: { name: true } },
  //         FavoritePerson: { select: { name: true, avatarUrl: true } },
  //       },
  //     });

  //     const count = await this.prisma.gcpItem.count({ where });

  //     // Generate signed URLs for coverUrl
  //     const resultsWithSignedUrls = await Promise.all(
  //       results.map(async (result) => {
  //         if (result.coverUrl) {
  //           result.coverUrl = await generateSignedUrl(result.coverUrl);
  //         }
  //         return result;
  //       })
  //     );

  //     return { results: resultsWithSignedUrls, count };
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }

  // async findOne(id: string) {
  //   try {
  //     const result = await this.prisma.gcpItem.findUnique({
  //       where: { id: id },
  //       include: {
  //         tags: true,
  //         Author: { select: { name: true } },
  //       },
  //     });

  //     if (result && result.coverUrl) {
  //       // Generate a signed URL for the coverUrl
  //       result.coverUrl = await generateSignedUrl(result.coverUrl);
  //     }

  //     return result;
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }

  // async update(id: string, updateGcpItemDto: UpdateGcpItemDto) {
  //   const { tagIds, ...rest } = updateGcpItemDto;
  //   try {
  //     const data: Prisma.GcpItemUncheckedUpdateInput = {
  //       ...rest,
  //       tags: {
  //         connect: tagIds.map((tag) => ({
  //           id: tag, // Connect existing tags by their ID
  //         })),
  //       },
  //     };

  //     return this.prisma.gcpItem.update({
  //       where: { id: id },
  //       data,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }

  // async remove(id: string) {
  //   try {
  //     return this.prisma.gcpItem.delete({ where: { id: id } });
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }

  // async getAccessToken() {
  //   try {
  //     const LOOKER_API_URL= 'https://pertamina.cloud.looker.com/'
  //     const LOOKER_CLIENT_ID= 'PpHqTPx8dv74G6bNPNN2'
  //     const LOOKER_CLIENT_SECRET= 'VrkrYFPcFCRHxBVtjwTnNVwr'
  //     const LOOKER_VERIFY_SSL= 'false'
  //     // const response = await axios.gcp(`${LOOKER_API_URL}/api/3.1/login`, {
  //     //   client_id: LOOKER_CLIENT_ID,
  //     //   client_secret: LOOKER_CLIENT_SECRET,
  //     // });
  //     // return response.data.access_token;
  //   } catch (error) {
  //     console.error('Error acquiring access token:', error);
  //     throw error;
  //   }
  // }

  // async acquireEmbedSession(userAgent: string, user: any): Promise<any> {
  //   try {
  //     // const cacheKey = `${user.external_user_id}/${userAgent}`
  //     // const embedSession = this.embedSessions[cacheKey]

  //     const request = {
  //       ...user,
  //       session_reference_token: user.session_reference_token,
  //     };

  //     console.log(`userAgent`, userAgent)
  //     console.log(`user`, user)

  //     // const response = await this.sdk.ok(
  //     //   this.sdk.acquire_embed_cookieless_session(request, {
  //     //     headers: {
  //     //       'User-Agent': userAgent,
  //     //     },
  //     //   })
  //     // );
  //     const response = await this.sdk.ok(login(this.sdk,
  //       {
  //         client_id: 'PpHqTPx8dv74G6bNPNN2',
  //         client_secret: 'VrkrYFPcFCRHxBVtjwTnNVwr'
  //       })
  //     );

  //     console.log(`response-response`,response)
  //     // this.embedSessions[cacheKey] = response

  //     return {
  //       access_token: response.access_token,
  //       api_token: response.api_token,
  //       api_token_ttl: response.api_token_ttl,
  //       authentication_token: response.authentication_token,
  //       authentication_token_ttl: response.authentication_token_ttl,
  //       navigation_token: response.navigation_token,
  //       navigation_token_ttl: response.navigation_token_ttl,
  //       session_reference_token_ttl: response.session_reference_token_ttl,
  //     };
  //   } catch (error) {
  //     console.error('Error acquiring embed session', { error });
  //     throw new Error('Failed to acquire Looker embed session');
  //   }
  // }

  // async getCurrentUser() {
  //   try {
  //     const user = await this.sdk.ok(this.sdk.me());
  //     console.log('Authenticated User:', user);
  //     return user;
  //   } catch (error) {
  //     console.error('Error fetching current user:', error);
  //     throw new Error('Failed to get current user');
  //   }
  // }
}
