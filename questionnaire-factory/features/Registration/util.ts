import { useOrganizations, useSettings } from '@/api/hooks';
import { findError, mapFetchData } from '@/api/util';

/**
 * Fetch all the data that the Registration component requires
 * @returns
 */
export const useRegistrationData = () => {
  const fetches = {
    organizations: useOrganizations(),
    settings: useSettings(),
  };

  const error = findError(fetches);

  return {
    loading: !error && fetches.settings.loading,
    data: mapFetchData(fetches),
    error,
  };
};
