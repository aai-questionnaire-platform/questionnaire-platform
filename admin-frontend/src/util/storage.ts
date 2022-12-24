import { pipe, split, map, fromPairs } from 'ramda';
import { Dict } from '../types';

export function getAllCookies(): Dict<any> {
  return pipe(split('; '), map(split('=') as any), fromPairs)(document.cookie);
}

export function getCookie(key: string) {
  const data = getAllCookies();
  return data[key];
}

export function setCookie(update: Dict<any>, expiration: number) {
  Object.keys(update).forEach((key) => {
    document.cookie = `${key}=${update[key]};max-age=${expiration};samesite=Lax; `;
  });
}
