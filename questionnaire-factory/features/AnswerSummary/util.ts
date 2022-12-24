import {
  useAnswers,
  useAnswerSummary,
  useQuestionnaire,
  useSettings,
} from '@/api/hooks';
import { anyLoading, findError, mapFetchData } from '@/api/util';

/**
 * Fetch all the data that the Category component requires
 * @returns
 */
export const useAnswerSummaryData = (categoryId: string) => {
  const questionnaire = useQuestionnaire();
  const userSettings = useSettings();

  const answers = useAnswers(
    questionnaire.data,
    userSettings.data?.organization_hierarchy
  );

  const answerSummary = useAnswerSummary(
    questionnaire.data,
    userSettings.data?.organization_hierarchy,
    categoryId
  );

  const fetches = { questionnaire, userSettings, answerSummary, answers };
  const error = findError(fetches);

  return {
    loading: !error && anyLoading(fetches),
    data: mapFetchData(fetches),
    error,
  };
};

export const formatOrdinal = (ordinal: number, t: any) =>
  ordinal > 0 && ordinal < 10
    ? t(`answerSummary.ordinalWithGenetive.${ordinal}`)
    : `${ordinal}.`;
