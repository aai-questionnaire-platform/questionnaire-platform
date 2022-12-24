import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { createFetcher, normalizeAnswers, withUrlParams } from '@/api/util';
import { useAppConfig } from '@/components/WithAppContext';
import { CategoryState } from '@/enums';
import {
  Answer,
  AnswerSummary,
  Group,
  Organization,
  Progress,
  Questionnaire,
} from '@/types';

export interface ApiRequestState<D, E = any> {
  data: D;
  error: E;
  loading: boolean;
}

type ApiHook<D, A extends any[] = any[], E = any> = (
  ...args: A
) => ApiRequestState<D, E>;

export const useQuestionnaire: ApiHook<Questionnaire, [boolean] | []> = (
  isAdmin = false
) => {
  const { lang: locale } = useAppConfig();
  const { data, error } = useSWRImmutable(
    withUrlParams(`${isAdmin ? 'groupadmin/' : ''}questionnaire`, { locale })
  );

  return {
    data,
    error,
    loading: !error && !data,
  };
};

export const useSettings: ApiHook<Record<string, any>> = () => {
  const { data, error } = useSWRImmutable('settings');
  return {
    data,
    error,
    loading: !error && !data,
  };
};

export const useGroupMembers: ApiHook<Record<string, any>> = (
  groupIds: string[]
) => {
  const { data, error } = useSWR(() =>
    withUrlParams('groupadmin/groupmember', {
      group_ids: groupIds.join(','),
    })
  );

  return {
    data,
    error,
    loading: !error && !data,
  };
};

export const useAnswers: ApiHook<Answer[], [Questionnaire, string[]]> = (
  questionnaire,
  organizationIds
) => {
  const { data, error } = useSWR(
    () =>
      withUrlParams('answers', {
        organization_ids: organizationIds.join(','),
        questionnaire_id: questionnaire.id,
      }),
    { revalidateOnFocus: false }
  );

  return {
    data: normalizeAnswers(data?.answers) as Answer[],
    error,
    loading: !error && !data,
  };
};

const useProgressBaseHook = (
  url: string,
  questionnaire: Questionnaire,
  organizationIds: string[],
  userId?: string
) => {
  const { data, error } = useSWR(() =>
    withUrlParams(url, {
      organization_ids: organizationIds.join(','),
      questionnaire_id: questionnaire.id,
      ...(userId && { user_id: userId }),
    })
  );

  return {
    data,
    error,
    loading: !error && !data,
  };
};

export const useProgress: ApiHook<
  Progress,
  [Questionnaire, string[], string]
> = (questionnaire, organizationIds, userId) =>
  useProgressBaseHook('progress', questionnaire, organizationIds, userId);

export const useAdminProgress: ApiHook<Progress, [Questionnaire, string[]]> = (
  questionnaire,
  organizationIds
) => useProgressBaseHook('groupadmin/progress', questionnaire, organizationIds);

export const useAnswerSummary: ApiHook<
  AnswerSummary,
  [Questionnaire, string[], string] | [Questionnaire, string[], string, boolean]
> = (questionnaire, organizationIds, categoryId, isAdmin = false) => {
  const { data, error } = useSWR(() =>
    withUrlParams(`${isAdmin ? 'groupadmin/' : ''}answersummary`, {
      category_id: categoryId,
      organization_ids: organizationIds.join(','),
      questionnaire_id: questionnaire.id,
    })
  );

  return {
    data,
    error,
    loading: !error && !data,
  };
};

/**
 * Fetch groups by their parent organization's id
 */
export const useGroups: ApiHook<Group[], [string, boolean] | [string]> = (
  parentOrganizationId: string,
  isAdmin = false
) => {
  const { data, error } = useSWRImmutable(() =>
    withUrlParams(`${isAdmin ? 'groupadmin/' : ''}groups`, {
      parent_organization_id: parentOrganizationId,
    })
  );

  return {
    data,
    error,
    loading: !error && !data,
  };
};

/**
 * Fetch organizations structure from the server (area, unit etc.)
 */
export const useOrganizations: ApiHook<Organization[], [boolean] | []> = (
  isAdmin = false
) => {
  const { lang: locale } = useAppConfig();
  const { data, error } = useSWRImmutable(
    withUrlParams(`${isAdmin ? 'groupadmin/' : ''}organizations`, { locale })
  );

  return {
    data: data?.organizations,
    error,
    loading: !error && !data,
  };
};

export const useFetcher = () => {
  const { data: session } = useSession();
  return useMemo(
    () => createFetcher(process.env.NEXT_PUBLIC_BACKEND_URL, session),
    [session]
  );
};

export const useUpdateCategoryState = (
  organizationIds: string[],
  questionnaireId: string
) => {
  const [loading, setLoading] = useState(false);
  const baseUrl = 'groupadmin/progress';
  const url = withUrlParams(baseUrl, {
    organization_ids: organizationIds.join(','),
    questionnaire_id: questionnaireId,
  });
  const { fetcher } = useSWRConfig() as any;
  const { data, mutate } = useSWR(url);

  const dispatch = async (props: {
    category_id: string;
    status: CategoryState;
  }) => {
    setLoading(true);

    try {
      await fetcher(baseUrl, {
        method: 'POST',
        body: JSON.stringify({
          ...props,
          organization_ids: organizationIds,
          questionnaire_id: questionnaireId,
        }),
      });

      const newStatuses = (data as Progress).category_statuses.map((status) =>
        status.category_id === props.category_id
          ? { ...status, state: props.status }
          : status
      );

      mutate({
        ...data,
        category_statuses: newStatuses,
      });
    } catch (e) {
      // TODO: Handle error
    } finally {
      setLoading(false);
    }
  };

  return { dispatch, loading };
};
