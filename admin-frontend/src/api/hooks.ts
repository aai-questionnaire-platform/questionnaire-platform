import { MutationResult, useMutation } from '@apollo/client';
import * as R from 'ramda';
import { useEffect, useState } from 'react';
import {
  categoryLens,
  groupLens,
  listCategoriesLens,
  listGroupsDataLens,
  listQuestionsLens,
  queryDataLens,
  questionLens,
  statusLens,
} from '../util/lenses';
import {
  Category,
  CategoryDto,
  Group,
  Question,
  QuestionDto,
  User,
} from '../types';
import {
  updateEntityStatusesToDraft,
  updateGroupsListWith,
  updateQuestionnaireWith,
} from './cacheUpdates';
import {
  CREATE_CATEGORY,
  CREATE_GROUP,
  CREATE_QUESTION,
  getMutationParams,
  PUBLISH_QUESTIONNAIRE,
  REMOVE_CATEGORY,
  REMOVE_GROUP,
  REMOVE_QUESTION,
  ROLLBACK_QUESTIONNAIRE,
  SORT_CATEGORIES,
  SORT_QUESTIONS,
  UPDATE_CATEGORY,
  UPDATE_GROUP,
  UPDATE_QUESTION,
} from './mutations';
import { LIST_OPTIONS, QUESTIONNAIRE } from './queries';
import { usersVar } from './reactiveVars';
import { getJSON } from './rest-connector';

type MutationHook<P, R = P> = (
  ...params: any[]
) => [(props: P) => any, MutationResult<R>];

interface ApiRequestState<T> {
  loading: boolean;
  result?: T;
  error?: Error;
}

export const useCreateGroupMutation: MutationHook<Group> = () => {
  const [saveGroup, result] = useMutation(CREATE_GROUP, {
    update: (cache, createQuery) => {
      const newGroup: Group = R.view(
        queryDataLens('createAndPublishGroup'),
        createQuery
      );
      updateGroupsListWith(
        newGroup.organizationUuid,
        R.over(listGroupsDataLens, R.append(newGroup)),
        cache
      );
    },
  });
  return [R.pipe(getMutationParams, saveGroup), result];
};

export const useEditGroupMutation: MutationHook<Group> = () => {
  const [editGroup, result] = useMutation(UPDATE_GROUP, {
    update: (cache, updateQuery) => {
      const update: Group = R.view(
        queryDataLens('updateAndPublishGroup'),
        updateQuery
      );
      updateGroupsListWith(
        update.organizationUuid,
        R.set(groupLens(update.entryId), update),
        cache
      );
    },
  });
  return [R.pipe(getMutationParams, editGroup), result];
};

export const useRemoveGroupMutation: MutationHook<any> = (
  entryId: string,
  organizationUuid: string
) => {
  const [removeGroup, result] = useMutation(REMOVE_GROUP, {
    optimisticResponse: {
      deleteGroup: {
        data: true,
        error: null,
        __typename: 'CmsDeleteResponse',
      },
    },
    update: (cache) => {
      updateGroupsListWith(
        organizationUuid,
        R.over(listGroupsDataLens, R.reject(R.propEq('entryId', entryId))),
        cache
      );
    },
  });

  return [
    R.pipe<Group, Record<string, any>, void>(getMutationParams, removeGroup),
    result,
  ];
};

export const useCreateCategoryMutation: MutationHook<CategoryDto, Category> = (
  questionnaireUuid: string
) => {
  const [saveCategory, result] = useMutation(CREATE_CATEGORY, {
    update: (cache, createQuery) => {
      const newCategory: Category = R.view(
        queryDataLens('createCategory'),
        createQuery
      );
      updateQuestionnaireWith(
        questionnaireUuid,
        R.over(listCategoriesLens, R.append(newCategory)),
        cache
      );
      updateEntityStatusesToDraft({ questionnaireUuid }, cache);
    },
  });

  return [R.pipe(getMutationParams, saveCategory), result];
};

export const useEditCategoryMutation: MutationHook<Category> = (
  questionnaireUuid: string
) => {
  const [updateCategory, result] = useMutation(UPDATE_CATEGORY, {
    update: (cache, updateQuery) => {
      const update: Category = R.view(
        queryDataLens('updateCategory'),
        updateQuery
      );
      updateQuestionnaireWith(
        questionnaireUuid,
        R.set(categoryLens(update.uuid), update),
        cache
      );
      updateEntityStatusesToDraft({ questionnaireUuid }, cache);
    },
  });

  return [R.pipe(getMutationParams, updateCategory), result];
};

export const useRemoveCategoryMutation: MutationHook<any> = (
  categoryUuid: string,
  questionnaireUuid: string
) => {
  const [removeCategory, result] = useMutation(REMOVE_CATEGORY, {
    optimisticResponse: {
      deleteCategory: {
        data: { uuid: categoryUuid },
        error: null,
        __typename: 'CmsDeleteResponse',
      },
    },
    update: (cache) => {
      updateQuestionnaireWith(
        questionnaireUuid,
        R.over(listCategoriesLens, R.reject(R.propEq('uuid', categoryUuid))),
        cache
      );

      updateEntityStatusesToDraft({ questionnaireUuid }, cache);
    },
  });

  return [R.pipe(getMutationParams, removeCategory), result];
};

export const useSortCategoriesMutation: MutationHook<any> = (
  questionnaireUuid: string
) => {
  const [sortCategories, result] = useMutation(SORT_CATEGORIES, {
    optimisticResponse: ({ data }) => ({
      sortCategories: {
        data: data.map(R.set(statusLens, 'draft')),
        error: null,
      },
    }),
    update: (cache, sortQuery) => {
      const updatedCategories: Category[] = R.view(
        queryDataLens('sortCategories'),
        sortQuery
      );

      updatedCategories.forEach((category) => {
        updateQuestionnaireWith(
          questionnaireUuid,
          R.set(categoryLens(category.uuid), category),
          cache
        );
      });

      updateEntityStatusesToDraft({ questionnaireUuid }, cache);
    },
  });

  return [
    (data) =>
      sortCategories({
        variables: { data },
        context: { clientName: 'manage' },
      }),
    result,
  ];
};

export const useSortQuestionsMutation: MutationHook<any> = (
  questionnaireUuid: string
) => {
  const [sortQuestions, result] = useMutation(SORT_QUESTIONS, {
    optimisticResponse: ({ data }) => ({
      sortQuestions: {
        data: data.map(R.set(statusLens, 'draft')),
        error: null,
      },
    }),
    update: (cache, sortQuery) => {
      const updatedQuestions: Question[] = R.view(
        queryDataLens('sortQuestions'),
        sortQuery
      );

      updatedQuestions.forEach((question) => {
        updateQuestionnaireWith(
          questionnaireUuid,
          R.set(questionLens(question.uuid), question),
          cache
        );
      });

      const { categoryUuid } = updatedQuestions[0];
      updateEntityStatusesToDraft({ questionnaireUuid, categoryUuid }, cache);
    },
  });

  return [
    (data) =>
      sortQuestions({
        variables: { data },
        context: { clientName: 'manage' },
      }),
    result,
  ];
};

/**
 * Mutation for creating new questions for a category
 * @param questionnaireId
 * @returns
 */
export const useCreateQuestionMutation: MutationHook<QuestionDto, Question> = (
  questionnaireUuid: string
) => {
  const [createQuestion, result] = useMutation(CREATE_QUESTION, {
    awaitRefetchQueries: true,
    refetchQueries: (createQuery) => {
      const newQuestion = R.view(queryDataLens('createQuestion'), createQuery);
      return [
        {
          query: LIST_OPTIONS,
          variables: {
            questionUuid: newQuestion.uuid,
          },
          context: { clientName: 'manage' },
        },
      ];
    },
    update: (cache, createQuery) => {
      const newQuestion = R.view(queryDataLens('createQuestion'), createQuery);
      const { options, ...question } = newQuestion;
      updateQuestionnaireWith(
        questionnaireUuid,
        R.over(listQuestionsLens, R.append(question)),
        cache
      );

      const { categoryUuid } = newQuestion;
      updateEntityStatusesToDraft({ questionnaireUuid, categoryUuid }, cache);
    },
  });

  return [R.pipe(getMutationParams, createQuestion), result];
};

/**
 * Mutation for updating existing questions
 * @param questionnaireUuid
 * @returns
 */
export const useUpdateQuestionMutation: MutationHook<QuestionDto, Question> = (
  questionnaireUuid: string
) => {
  const [updateQuestion, result] = useMutation(UPDATE_QUESTION, {
    awaitRefetchQueries: true,
    refetchQueries: (updateQuery) => {
      const newQuestion = R.view(queryDataLens('updateQuestion'), updateQuery);
      return [
        {
          query: LIST_OPTIONS,
          variables: {
            questionUuid: newQuestion.uuid,
          },
          context: { clientName: 'manage' },
        },
      ];
    },
    update: (cache, updateQuery) => {
      const updatedQuestion = R.view(
        queryDataLens('updateQuestion'),
        updateQuery
      );
      const { options, ...question } = updatedQuestion;
      updateQuestionnaireWith(
        questionnaireUuid,
        R.set(questionLens(updatedQuestion.uuid), question),
        cache
      );

      const { categoryUuid } = updatedQuestion;
      updateEntityStatusesToDraft({ questionnaireUuid, categoryUuid }, cache);
    },
  });

  return [R.pipe(getMutationParams, updateQuestion), result];
};

/**
 * Mutation for removing questions
 * @param questionnaireId
 * @returns
 */
export const useRemoveQuestionMutation: MutationHook<any> = (
  questionUuid: string,
  categoryUuid: string,
  questionnaireUuid: string
) => {
  const [removeQuestion, result] = useMutation(REMOVE_QUESTION, {
    optimisticResponse: {
      deleteQuestion: {
        data: {
          uuid: questionUuid,
        },
        error: null,
        __typename: 'CmsDeleteResponse',
      },
    },
    update: (cache) => {
      updateQuestionnaireWith(
        questionnaireUuid,
        R.over(listQuestionsLens, R.reject(R.propEq('uuid', questionUuid))),
        cache
      );
      updateEntityStatusesToDraft({ questionnaireUuid, categoryUuid }, cache);
    },
  });

  return [R.pipe(getMutationParams, removeQuestion), result];
};

export const usePublishQuestionnaireMutation: MutationHook<any> = (
  questionnaireUuid: string
) => {
  const [publishQuestionnaire, result] = useMutation(PUBLISH_QUESTIONNAIRE, {
    ...getMutationParams({ questionnaireUuid }),
    awaitRefetchQueries: true,
    refetchQueries: [refetchQuestionnaire(questionnaireUuid)],
  });
  return [publishQuestionnaire, result];
};

export const useRollbackQuestionnaireMutation: MutationHook<any> = (
  questionnaireUuid: string
) => {
  const [rollbackQuestionnaire, result] = useMutation(ROLLBACK_QUESTIONNAIRE, {
    ...getMutationParams({ questionnaireUuid }),
    awaitRefetchQueries: true,
    refetchQueries: [refetchQuestionnaire(questionnaireUuid)],
  });

  return [rollbackQuestionnaire, result];
};

export const useFetchUsersHook = (organizationId: string) => {
  const [state, setState] = useState<ApiRequestState<User[]>>({
    loading: false,
    result: usersVar(),
    error: undefined,
  });

  useEffect(() => {
    async function fetchUsers() {
      setState((s) => ({
        ...s,
        result: undefined,
        loading: true,
        error: undefined,
      }));

      usersVar([]);

      try {
        const { message } = await getJSON('users', { organizationId });
        usersVar(message);
        setState((s) => ({ ...s, result: message }));
      } catch (e: any) {
        setState((s) => ({ ...s, error: e }));
      } finally {
        setState((s) => ({ ...s, loading: false }));
      }
    }

    fetchUsers();
  }, [organizationId]);

  return state;
};

function refetchQuestionnaire(questionnaireUuid: string) {
  return {
    query: QUESTIONNAIRE,
    variables: {
      uuid: questionnaireUuid,
    },
    context: { clientName: 'manage' },
  };
}
