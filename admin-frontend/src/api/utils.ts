import { isEmpty, join, toPairs } from 'ramda';
import { getCookie } from '../util/storage';
import type { Dict } from '../types';

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

/**
 * Append Relative path to URL base from configuration.
 * @param path Relative path
 * @returns Full URL where request can be made
 */
export const formApiUrl = (path: string) =>
  `${process.env.REACT_APP_API_HOST}/${path}`;

export const withAuthHeader = (headers: Dict<string> = {}) => {
  const authToken = getCookie('accessToken');
  return {
    ...headers,
    Authorization: `Bearer ${authToken}`,
  };
};
