import { Injectable } from '@nestjs/common';
import { BqueryService } from 'src/bquery/bquery.service';

@Injectable()
export class DashboardService {
  constructor(private readonly bq: BqueryService) {}

  async chekChildTeamIds(teamId: string) {
    const isAdmin = teamId === 'admin';

    const whereClause = isAdmin ? '' : 'WHERE id = @teamId';

    const query = `
      WITH RECURSIVE OrgTree AS (
        SELECT 
          id,
          parentId,
          name,
          companyCode
        FROM ptpl-land-prd.postitpublic.Organization
        ${whereClause}

        UNION ALL

        SELECT
          o.id,
          o.parentId,
          o.name,
          o.companyCode
        FROM ptpl-land-prd.postitpublic.Organization o
        JOIN OrgTree ot ON o.parentId = ot.id
      )
      SELECT * FROM OrgTree;
    `;

    const options = {
      query,
      params: isAdmin ? {} : { teamId },
    };

    const results = await this.bq.runQuery(options);
    return results;
  }

  async findPostClickDashboard(teamId: string) {
    const isAdmin = teamId === 'admin';

    let whereClause = 'WHERE isFeatured = false';
    if (!isAdmin) {
      const checkTeams = await this.chekChildTeamIds(teamId);
      const checkTeamIds = checkTeams.map((org) => `'${org.id}'`);

      whereClause = `WHERE teamId IN (${checkTeamIds}) AND isFeatured = false`;
    }

    const query = `
      SELECT 
        id, 
        tags,
        coverUrl,
        total_clicks, 
        title, 
        link, 
        metaDescription, 
        authorId, 
        isFeatured, 
        teamId,
        tags
      FROM 
        (
          SELECT 
            postItemId, 
            COUNT(1) AS total_clicks 
          FROM 
            ptpl-land-prd.postitpublic.PostItemClick
          GROUP BY 
            postItemId
          ORDER BY 
            postItemId
        ) A 
        INNER JOIN ptpl-land-prd.postitpublic.PostItem B ON A.postItemId = B.id
        LEFT JOIN (
          SELECT A as postItemId, ARRAY_AGG(B) AS tags
          FROM ptpl-land-prd.postitpublic._PostItemTags
          GROUP BY A
        ) C ON B.id = C.postItemId
      ${whereClause}
      ORDER BY total_clicks DESC;
    `;

    const options = {
      query,
      params: isAdmin ? {} : { teamId },
    };

    const results = await this.bq.runQuery(options);
    return results;
  }

  async findUserClickDashboardYearly(teamId: string) {
    const isAdmin = teamId === 'admin';

    let whereClause = '';
    if (!isAdmin) {
      const checkTeams = await this.chekChildTeamIds(teamId);
      const checkTeamIds = checkTeams.map((org) => `'${org.id}'`);

      whereClause = `WHERE C.teamId IN (${checkTeamIds})`;
    }

    const query = `
      SELECT C.teamId, D.name, count(1) as total_clicks,
          EXTRACT(YEAR FROM timestamp) AS year,
          FORMAT_DATE('%b', DATE_TRUNC(DATE(timestamp), MONTH)) AS month,
          EXTRACT(MONTH FROM timestamp) AS month_name
      FROM
        ptpl-land-prd.postitpublic.UserLog A 
        LEFT JOIN ptpl-land-prd.postitpublic.User B ON A.userId=B.id
        LEFT JOIN ptpl-land-prd.postitpublic.Position C ON B.positionId=C.id
        LEFT JOIN ptpl-land-prd.postitpublic.Organization D ON C.teamId=D.id
        ${whereClause}
      GROUP BY C.teamId, D.name, year, month, month_name
    `;

    const options = {
      query,
      params: isAdmin ? {} : { teamId },
    };

    const result = await this.bq.runQuery(options);
    return result;
  }

  async findPostClickDashboardYearly(teamId: string) {
    const isAdmin = teamId === 'admin';

    let whereClause = 'WHERE isFeatured = false';
    if (!isAdmin) {
      const checkTeams = await this.chekChildTeamIds(teamId);
      const checkTeamIds = checkTeams.map((org) => `'${org.id}'`);

      whereClause = `WHERE B.teamId IN (${checkTeamIds}) AND isFeatured = false`;
    }

    const query = `
      WITH click_counts AS (
        SELECT 
          postItemId, 
          EXTRACT(YEAR FROM createdAt) AS year,
          FORMAT_DATE('%b', DATE_TRUNC(DATE(createdAt), MONTH)) AS month,
          EXTRACT(MONTH FROM createdAt) AS month_name,
          COUNT(1) AS total_clicks 
        FROM 
          ptpl-land-prd.postitpublic.PostItemClick 
        GROUP BY 
          postItemId, 
          year,
          month_name,
          month
      ),
      joined_data AS (
        SELECT
          A.year,
          A.month,
          B.title AS name,
          A.total_clicks
        FROM click_counts A
        INNER JOIN ptpl-land-prd.postitpublic.PostItem B 
          ON A.postItemId = B.id
        ${whereClause}
      ),
      ranked_data AS (
        SELECT *,
          ROW_NUMBER() OVER (PARTITION BY year ORDER BY total_clicks DESC) AS rank
        FROM joined_data
      )
      SELECT
        year,
        month,
        name,
        total_clicks
      FROM ranked_data
      WHERE total_clicks > 3
      ORDER BY year, total_clicks DESC, name;
    `;

    const options = {
      query,
      params: isAdmin ? {} : { teamId },
    };

    const result = await this.bq.runQuery(options);
    return result;
  }

  async findPostClickDashboardByAuthor(teamId: string) {
    const isAdmin = teamId === 'admin';

    let whereClause = 'WHERE isFeatured = false';
    if (!isAdmin) {
      const checkTeams = await this.chekChildTeamIds(teamId);
      const checkTeamIds = checkTeams.map((org) => `'${org.id}'`);

      whereClause = `WHERE teamId IN (${checkTeamIds}) AND isFeatured = false`;
    }

    const query = `
      SELECT 
        SUM(total_clicks) AS total_clicks_post, 
        authorId, 
        C.name
      FROM 
        (
          SELECT 
            postItemId, 
            COUNT(1) AS total_clicks 
          FROM 
            ptpl-land-prd.postitpublic.PostItemClick
          GROUP BY 
            postItemId
          ORDER BY 
            postItemId
        ) A 
        INNER JOIN ptpl-land-prd.postitpublic.PostItem B ON A.postItemId = B.id
        LEFT JOIN ptpl-land-prd.postitpublic.User C ON B.authorId = C.id
      ${whereClause}
      GROUP BY authorId, C.name
      ORDER BY total_clicks_post DESC;
    `;

    const options = {
      query,
      params: isAdmin ? {} : { teamId },
    };

    const results = await this.bq.runQuery(options);
    return results;
  }
  async findPostDashboardByAuthor(teamId: string) {
    const isAdmin = teamId === 'admin';

    let whereClause = 'WHERE isFeatured = false';
    if (!isAdmin) {
      const checkTeams = await this.chekChildTeamIds(teamId);
      const checkTeamIds = checkTeams.map((org) => `'${org.id}'`);

      whereClause = `WHERE teamId IN (${checkTeamIds}) AND isFeatured = false`;
    }

    const query = `
      SELECT 
        COUNT(1) AS total_posts, 
        authorId, 
        C.name
      FROM ptpl-land-prd.postitpublic.PostItem B
        LEFT JOIN ptpl-land-prd.postitpublic.User C ON B.authorId = C.id
      ${whereClause}
      GROUP BY authorId, C.name
      ORDER BY total_posts DESC;
    `;

    const options = {
      query,
      params: isAdmin ? {} : { teamId },
    };

    const results = await this.bq.runQuery(options);
    return results;
  }
  async findPostDashboardConversion(teamId: string) {
    const isAdmin = teamId === 'admin';

    const whereClause = isAdmin
      ? 'WHERE isFeatured = false'
      : 'WHERE teamId = @teamId AND isFeatured = false';

    const query = `
      SELECT 
        COUNT(B.id) AS total_posts,
        COUNT(CASE WHEN A.postItemId IS NOT NULL THEN 1 END) AS total_clicks
      FROM (
          SELECT 
            postItemId 
          FROM 
            ptpl-land-prd.postitpublic.PostItemClick
          GROUP BY 
            postItemId
          ORDER BY 
            postItemId
        ) A
      RIGHT JOIN ptpl-land-prd.postitpublic.PostItem B 
        ON A.postItemId = B.id
      ${whereClause};
    `;

    const options = {
      query,
      params: isAdmin ? {} : { teamId },
    };

    const results = await this.bq.runQuery(options);
    return results;
  }

  async findPostDashboardActiveUsers(teamId: string) {
    const isAdmin = teamId === 'admin';

    let whereClause = '';
    if (!isAdmin) {
      const checkTeams = await this.chekChildTeamIds(teamId);
      const checkTeamIds = checkTeams.map((org) => `'${org.id}'`);

      whereClause = `WHERE teamId IN (${checkTeamIds})`;
    }

    const query = `
      SELECT 
        COUNT(1) AS total_users,
        COUNT(CASE WHEN B.authorId IS NOT NULL THEN 1 END) AS total_users_posted
      FROM (
        SELECT DISTINCT authorId 
        FROM ptpl-land-prd.postitpublic.PostItem
        WHERE isFeatured = false
      ) B
      RIGHT JOIN ptpl-land-prd.postitpublic.User C ON B.authorId = C.id
      LEFT JOIN ptpl-land-prd.postitpublic.Position D ON C.positionId = D.id 
      ${whereClause};
    `;

    const options = {
      query,
      params: isAdmin ? {} : { teamId },
    };

    const results = await this.bq.runQuery(options);
    return results;
  }
}
