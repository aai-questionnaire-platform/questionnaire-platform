function reorder(array: any[], startIndex: number, endIndex: number) {
  const result = Array.from(array);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function createSortChangeSet(
  array: any[],
  startIndex: number,
  endIndex: number
) {
  const min = Math.min(startIndex, endIndex);
  const max = Math.max(startIndex, endIndex);

  return reorder(array, startIndex, endIndex)
    .map((item, index) => ({ ...item, sortIndex: index }))
    .slice(min, max + 1);
}
