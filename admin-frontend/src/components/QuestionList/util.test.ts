import { flattenOptionErrors, resolveNextSortIndex } from './util';

describe('flattenOptionErrors', () => {
  it('should return an empty array when no errors', () => {
    expect(flattenOptionErrors({})).toEqual([]);
  });

  it('should filter empty errors', () => {
    expect(
      flattenOptionErrors({
        options: [null, undefined, ''],
      })
    ).toEqual([]);
  });

  it('should return an error for each options error', () => {
    expect(
      flattenOptionErrors({
        options: [{}, {}, {}],
      }).length
    ).toEqual(3);
  });

  it('should return correct error object for each options error', () => {
    expect(
      flattenOptionErrors({
        options: [{}, {}, {}],
      }).length
    ).toEqual(3);
  });

  it('should return a correct error', () => {
    expect(
      flattenOptionErrors({
        options: [
          null,
          {
            label: {
              field: 'option',
              error: 'required',
            },
          },
          {
            label: {
              field: 'option',
              error: 'min',
            },
          },
        ],
      })
    ).toEqual([
      {
        field: 'option',
        error: 'required',
        index: 2,
      },
      {
        field: 'option',
        error: 'min',
        index: 3,
      },
    ]);
  });
});

describe('resolveSortIndex', () => {
  it('should return 1 when an empty list is provided', () => {
    expect(resolveNextSortIndex([])).toEqual(1);
  });

  it('should return the highest sortIndex plus one', () => {
    const arr = [{ sortIndex: 6 }, { sortIndex: 1 }];
    expect(resolveNextSortIndex(arr)).toEqual(7);
  });
});
