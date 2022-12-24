import * as R from 'ramda';

import { useGroups, useOrganizations, useQuestionnaire } from '@/api/hooks';
import { anyLoading, findError, mapFetchData } from '@/api/util';
import { CategoryState } from '@/enums';
import { Progress, Category, CategoryWithProgress } from '@/types';
import { combineCategoryWithProgress } from '@/util';

export const findActiveCategories = (
  progress: Progress,
  categories: Category[]
) =>
  R.pipe<[Category[]], any, CategoryWithProgress[]>(
    R.map(combineCategoryWithProgress(progress)),
    R.filter(
      R.propSatisfies(
        (state) =>
          state > CategoryState.LOCKED && state < CategoryState.APPROVED,
        'state'
      )
    )
  )(categories);

export const useAdminGroupsData = (organizationId: string) => {
  const fetches = {
    questionnaire: useQuestionnaire(true),
    organizations: useOrganizations(true),
    groups: useGroups(organizationId, true),
  };

  const error = findError(fetches);

  return {
    loading: !error && anyLoading(fetches),
    data: mapFetchData(fetches),
    error,
  };
};
