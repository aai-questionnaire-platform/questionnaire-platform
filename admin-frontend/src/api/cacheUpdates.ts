import { ApolloCache } from '@apollo/client';
import * as R from 'ramda';
import { categoryStatusLens, questionnaireStatusLens } from '../util/lenses';
import { LIST_GROUPS, QUESTIONNAIRE } from './queries';

/**
 * Update groups list in the cache using the [updateData] function
 * @param organizationUuid
 * @param updateData
 * @param cache
 */
export const updateGroupsListWith = (
  organizationUuid: string,
  updateData: Function,
  cache: ApolloCache<any>
) => {
  const queryProps = {
    query: LIST_GROUPS,
    variables: { parentId: organizationUuid },
  };

  updateCacheQuery(queryProps, updateData, cache);
};

/**
 * Update categories list in the cache using the [updateData] function
 * @param questionnaireId
 * @param updateData
 * @param cache
 */
export const updateQuestionnaireWith = (
  questionnaireId: string,
  updateData: Function,
  cache: ApolloCache<any>
) => {
  const queryProps = {
    query: QUESTIONNAIRE,
    variables: { uuid: questionnaireId },
  };

  updateCacheQuery(queryProps, updateData, cache);
};

const updateCacheQuery = (
  queryProps: any,
  updateData: Function,
  cache: ApolloCache<any>
) => {
  const query = cache.readQuery({
    ...queryProps,
  });

  if (query) {
    const updatedData = updateData(query);

    cache.writeQuery({
      ...queryProps,
      data: updatedData,
    });
  }
};

export const updateEntityStatusesToDraft = (
  uuids: { questionnaireUuid: string; categoryUuid?: string },
  cache: ApolloCache<any>
) => {
  const { questionnaireUuid, categoryUuid } = uuids;

  const queryProps = {
    query: QUESTIONNAIRE,
    variables: {
      uuid: questionnaireUuid,
    },
  };

  const query = cache.readQuery({
    ...queryProps,
  }) as any;

  if (query) {
    let updatedData = R.set(
      questionnaireStatusLens(questionnaireUuid),
      'draft',
      query
    );

    updatedData = categoryUuid
      ? R.set(categoryStatusLens(categoryUuid), 'draft', updatedData)
      : updatedData;

    cache.writeQuery({
      ...queryProps,
      data: updatedData,
    });
  }
};
