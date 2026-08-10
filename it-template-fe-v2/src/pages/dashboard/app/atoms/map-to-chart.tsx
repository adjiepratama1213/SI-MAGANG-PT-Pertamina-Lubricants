export type RawRow = {
  year: number;
  month: string; // 'Jan' - 'Dec'
  name: string; // title
  total_clicks: number;
};

export type FormattedData = {
  categories: string[];
  series: {
    year: string;
    data: {
      name: string;
      data: number[]; // length: 12
    }[];
  }[];
};

export function mapToChartData(rows: RawRow[] = []): FormattedData {
  const allMonths = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const groupedByYear: Record<string, Record<string, Record<string, number>>> = {};
  if (!Array.isArray(rows)) {
    return {
      categories: allMonths,
      series: [],
    };
  }
  rows.forEach(({ year, month, name, total_clicks }) => {
    if (!groupedByYear[year]) groupedByYear[year] = {};
    if (!groupedByYear[year][name]) groupedByYear[year][name] = {};

    groupedByYear[year][name][month] = total_clicks;
  });

  const series = Object.entries(groupedByYear).map(([year, posts]) => ({
    year,
    data: Object.entries(posts).map(([name, monthData]) => ({
      name,
      data: allMonths.map((month) => monthData[month] || 0),
    })),
  }));

  return {
    categories: allMonths,
    series,
  };
}
