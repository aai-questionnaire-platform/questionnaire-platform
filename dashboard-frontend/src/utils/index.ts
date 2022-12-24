import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => paramsToObject(new URLSearchParams(search)), [search]);
}

function paramsToObject(params: URLSearchParams) {
  const result: Record<string, string> = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

export function withUrlParams(path: string, params: Record<string, string>) {
  return `${path}?${new URLSearchParams(params).toString()}`;
}
