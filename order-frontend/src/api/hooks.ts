import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';

import { Service } from '@/api/types';
import { getWithAuth } from './rest-connector';

export const fetcher = async (url: string) => {
  return getWithAuth(url);
};

function useApi<T>(endpoint: string, immutable: boolean = false) {
  const { data, error } = (immutable ? useSWRImmutable : useSWR)<T>(
    endpoint,
    fetcher
  );

  return {
    data,
    error,
    loading: !data && !error,
  };
}

export function useServices() {
  return useApi<Service[]>('services');
}
