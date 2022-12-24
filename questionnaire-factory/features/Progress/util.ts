import { useSession } from 'next-auth/react';

import { useProgress, useQuestionnaire, useSettings } from '@/api/hooks';
import { anyLoading, findError, mapFetchData } from '@/api/util';

/**
 * Fetch all the data that the Progress-component requires
 * @returns
 */
export const useProgressData = () => {
  const settings = useSettings();
  const questionnaire = useQuestionnaire();
  const { data: session } = useSession();

  const progress = useProgress(
    questionnaire.data,
    settings.data?.organization_hierarchy,
    session!.user.userId
  );

  const fetches = { questionnaire, settings, progress };
  const error = findError(fetches);

  return {
    loading: !error && anyLoading(fetches),
    data: mapFetchData(fetches),
    error,
  };
};
