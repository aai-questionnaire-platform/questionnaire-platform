import * as R from 'ramda';

export const queryDataLens = (queryName: string) =>
  R.lensPath(['data', queryName, 'data']);

export const queryErrorLens = (queryName: string) =>
  R.lensPath(['data', queryName, 'error']);
