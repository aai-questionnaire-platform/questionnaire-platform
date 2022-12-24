import {
  useAdminProgress,
  useAnswerSummary,
  useQuestionnaire,
} from '@/api/hooks';
import { anyLoading, findError, mapFetchData } from '@/api/util';

export const useAdminAnswerSummaryData = (
  categoryId: string,
  organizationIds: string[]
) => {
  const questionnaire = useQuestionnaire(true);
  const answerSummary = useAnswerSummary(
    questionnaire.data,
    organizationIds,
    categoryId,
    true
  );
  const progress = useAdminProgress(questionnaire.data, organizationIds);

  const fetches = { questionnaire, answerSummary, progress };
  const error = findError(fetches);

  return {
    loading: !error && anyLoading(fetches),
    data: mapFetchData(fetches),
    error,
  };
};
