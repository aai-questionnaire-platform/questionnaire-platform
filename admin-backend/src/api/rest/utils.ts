import { isEmpty, join, toPairs } from 'ramda';
import type { Dict } from '../../types';

const formParamString = (params: Dict<any>) =>
  toPairs(params).map(join('=')).join('&');

/**
 * Append url parameters to a path
 * @param path
 * @param params
 */
export const withUrlParams = (
  path: string,
  params: Dict<string | number | boolean> = {}
) => (isEmpty(params) ? path : `${path}?${formParamString(params)}`);

export const withAuthHeader = (
  authToken: string,
  headers: Dict<string> = {}
) => {
  return {
    ...headers,
    'x-api-key': authToken,
  };
};

export const withJSONContentHeader = (headers: Dict<string> = {}) => ({
  ...headers,
  'Content-Type': 'application/json',
});
