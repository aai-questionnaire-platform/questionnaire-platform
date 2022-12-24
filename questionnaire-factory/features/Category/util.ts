import { useSession } from 'next-auth/react';

import {
  useAnswers,
  useProgress,
  useQuestionnaire,
  useSettings,
} from '@/api/hooks';
import { findError, anyLoading, mapFetchData } from '@/api/util';

/**
 * Fetch all the data that the Category component requires
 * @returns
 */
export const useCategoryData = () => {
  const userSettings = useSettings();
  const questionnaire = useQuestionnaire();
  const answers = useAnswers(
    questionnaire.data,
    userSettings.data?.organization_hierarchy
  );
  const { data: session } = useSession();

  const progress = useProgress(
    questionnaire.data,
    userSettings.data?.organization_hierarchy,
    session!.user.userId
  );

  const fetches = { questionnaire, userSettings, answers, progress };
  const error = findError(fetches);

  return {
    loading: !error && anyLoading(fetches),
    data: mapFetchData(fetches),
    error,
  };
};
