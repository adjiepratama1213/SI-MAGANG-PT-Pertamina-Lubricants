export function extractTeamIds(
  filter: any,
  result = { teamId: [] as string[], teamIds: [] as string[] }
) {
  if (typeof filter !== 'object' || filter === null) return result;

  // Tangkap "teamId.in"
  if ('teamId' in filter && Array.isArray(filter.teamId?.in)) {
    result.teamId.push(...filter.teamId.in);
  }

  // Tangkap "teamIds.some.id.in"
  if (
    'teamIds' in filter &&
    typeof filter.teamIds === 'object' &&
    typeof filter.teamIds.some === 'object' &&
    typeof filter.teamIds.some.id === 'object' &&
    Array.isArray(filter.teamIds.some.id.in)
  ) {
    result.teamIds.push(...filter.teamIds.some.id.in);
  }

  // Rekursi ke dalam semua child object/array
  for (const key in filter) {
    const value = filter[key];
    if (typeof value === 'object') {
      extractTeamIds(value, result);
    }
  }

  // Hapus duplikat
  result.teamId = Array.from(new Set(result.teamId));
  result.teamIds = Array.from(new Set(result.teamIds));

  return result;
}
