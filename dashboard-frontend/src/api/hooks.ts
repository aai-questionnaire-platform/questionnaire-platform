import useSWR from 'swr';

import { Service, ServiceCategory } from '@/api/types';
import { fetcher } from '@/api/utils';

function useApi<T>(endpoint?: string) {
  const { data, error } = useSWR<T>(
    endpoint ? `${process.env.REACT_APP_API_URL}/${endpoint}` : null,
    fetcher
  );

  return {
    data,
    error,
    loading: !data && !error,
  };
}

export function useRecommendations(shouldFetch = true) {
  const {
    data: recData,
    error: recError,
    loading: recLoading,
  } = useApi<string[]>(shouldFetch ? 'recommendations' : undefined);
  const {
    data: serviceData,
    error: serviceError,
    loading: serviceLoading,
  } = useApi<Service[]>(shouldFetch ? 'services' : undefined);

  const services = serviceData?.filter((service) =>
    recData?.includes(service.id)
  );

  const loading = recLoading || serviceLoading;
  const error = recError || serviceError;

  return { data: services, loading, error };
}

export function useServices() {
  return useApi<Service[]>('services');
}

export function useServiceCategories() {
  return useApi<ServiceCategory[]>('service-categories');
}

export function useCategory(id?: string) {
  const { data, error, loading } = useServiceCategories();

  const category = data?.find((category) => category.id === id);

  return { data: category, error, loading };
}
