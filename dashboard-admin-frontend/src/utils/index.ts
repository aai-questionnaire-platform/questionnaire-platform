import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => paramsToObject(new URLSearchParams(search)), [search]);
}

export function useHashParams() {
  const { hash } = useLocation();
  const params = new URLSearchParams(hash);
  return params;
}

function paramsToObject(params: URLSearchParams) {
  const result: Record<string, string> = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}
