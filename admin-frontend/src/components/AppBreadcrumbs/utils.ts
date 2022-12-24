import paths from '../../routes/paths';
import { Dict } from '../../types';

type PathKey = keyof typeof paths;

function formatPathKey(arg: string) {
  return arg.toUpperCase().replace('-', '_') as PathKey;
}

export function getRoutePath(route: string) {
  return route ? paths[formatPathKey(route)] : paths.HOME;
}

export function paramsToObject(params: URLSearchParams) {
  const result: Dict<string | number | boolean> = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}
