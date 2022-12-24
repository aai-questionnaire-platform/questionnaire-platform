import * as R from 'ramda';

/**
 * Creates an matcher lens that finds an entry from an array whose [propName] matches the given [propValue]
 * @param propName
 * @returns
 */
export const lensMatch = R.curry((propName: string, propValue: any) =>
  R.lens(R.find(R.propEq(propName, propValue)), (val, arr) =>
    // either update the item in current index or append the item to the end of the list
    R.update(R.findIndex(R.propEq(propName, propValue), arr), val as any, arr)
  )
);

export const metaTitleLens = R.lensPath(['meta', 'title']);

export const listCategoriesLens = R.lensProp<{ categories: any[] }>(
  'categories'
);

export const categoryLens = (id: string): any =>
  R.compose(listCategoriesLens, lensMatch('id', id));
