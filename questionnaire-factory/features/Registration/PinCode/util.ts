import useSWRImmutable from 'swr/immutable';

import { withUrlParams } from '@/api/util';

/**
 * Fetch a group by pin code
 */
export const useGroup = (pin?: string) => {
  const { data, error } = useSWRImmutable(() =>
    pin ? withUrlParams('groups', { pin }) : null
  );

  return {
    data,
    error,
    loading: !!(pin && !error && !data),
  };
};
