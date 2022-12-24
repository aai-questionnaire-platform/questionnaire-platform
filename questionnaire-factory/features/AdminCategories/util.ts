import { useAdminProgress, useGroups, useQuestionnaire } from '@/api/hooks';
import { anyLoading, findError, mapFetchData } from '@/api/util';

export const useAdminCategoriesData = (organizationIds: string[]) => {
  const questionnaire = useQuestionnaire(true);
  const groups = useGroups(organizationIds[organizationIds.length - 2], true);
  const progress = useAdminProgress(questionnaire.data, organizationIds);

  const fetches = { questionnaire, groups, progress };

  const error = findError(fetches);

  return {
    loading: !error && anyLoading(fetches),
    data: mapFetchData(fetches),
    error,
  };
};
