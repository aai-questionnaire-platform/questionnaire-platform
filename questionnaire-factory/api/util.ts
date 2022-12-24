import { Session } from 'next-auth';
import { signIn } from 'next-auth/react';
import * as R from 'ramda';

import { Answer, AnswerSet, AnswerSetKey, Questionnaire } from '@/types';
import { transformObjValues } from '@/util';

/**
 * An error caused by an invalid request
 * @class InvalidRequestError
 * @extends {Error}
 */
export class ApiResponseError extends Error {
  status = 0;
  url = '';

  constructor(message: string, status: number, url?: string) {
    super(message);
    this.status = status;
    this.url = url || '';
  }
}

function isAdminPath(urlString: string) {
  const { pathname } = new URL(urlString);
  return pathname.includes('/groupadmin/');
}

/**
 * Create a fetcher function for SWR that will handle responses and errors in an uniform way
 * @param appMeta
 * @param backendUrl
 * @param session
 * @returns
 */
export function createFetcher(backendUrl: any, session: Session | null) {
  return async (url: string, config: RequestInit = {}) => {
    const conf = {
      ...config,
      headers: {
        ...(config.headers ?? {}),
        ...(session && { Authorization: `Bearer ${session.token}` }),
        'Content-type': 'application/json',
      },
    };

    try {
      const res = await fetch(`${backendUrl}/${url}`, conf);

      // If the status code is not in the range 200-299,
      // we still try to parse and throw it.
      if (!res.ok) {
        throw new ApiResponseError(
          res.statusText || 'An error occurred while fetching the data.',
          res.status,
          res.url
        );
      }

      return res.json();
    } catch (e: any) {
      // if the status is unauthorized redirect to the login page
      if (session && e.status === 401) {
        signIn(
          isAdminPath(e.url)
            ? `admin-${process.env.NEXT_PUBLIC_PROVIDER_EXTENSION}`
            : `auroraai-${process.env.NEXT_PUBLIC_PROVIDER_EXTENSION}`
        );
      }

      // if already a server response error then just pass the error onward
      if (e.status) {
        throw e;
      }

      // if the error thrown was not a ServerResponseError then the request
      // failed altogether and it has neither statusText nor status
      // this can be a result of CORS or connection error
      throw new ApiResponseError(e.message, 0);
    }
  };
}

/**
 * Create a config for SWR. R.once guards the invocation so that this is actually only called once!
 * @param appMeta
 * @param session
 * @returns
 */
export const createSwrConfig = (session: Session | null) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    throw new Error(`Backend URL not set`);
  }

  return {
    fetcher: createFetcher(backendUrl, session),
    shouldRetryOnError: false,
  };
};

const formParamString = (params: Record<string, string | number | boolean>) =>
  R.toPairs(params).map(R.join('=')).join('&');

/**
 * Append url parameters to a path
 * @param path
 * @param params
 */
export const withUrlParams = (
  path: string,
  params: Record<string, string | number | boolean> = {}
) => (R.isEmpty(params) ? path : `${path}?${formParamString(params)}`);

const generateAnswerSetKey = (
  organizationIds: string[],
  questionnaireId: string
): AnswerSetKey => {
  if (!organizationIds?.length) {
    throw new Error(
      'InvalidArgumentsException: OrganizationIds missing or empty!'
    );
  }

  return {
    questionnaire_id: questionnaireId,
    organization_ids: organizationIds,
  };
};

const expandMultiAnswers = (answer: Answer) =>
  answer.answer_value.split(',').map((value) => ({
    question_id: answer.question_id,
    answer_value: value,
  }));

/**
 * Generate answerset for saving
 * @param profile
 * @param questionnaireId
 * @throws if profile.parish or profile.confirmationGroup is missing
 * @returns
 */
export const generateAnswerSet = (
  organizationIds: string[],
  questionnaire: Questionnaire,
  answers: Answer[]
): AnswerSet => ({
  key: generateAnswerSetKey(organizationIds, questionnaire.id),
  answers: R.chain(expandMultiAnswers, answers),
  questionnaire_version: questionnaire.version,
});

const combineAnswers = R.curry((answers: Answer[], id: string) => {
  const all = answers.filter(R.propEq('question_id', id));
  return {
    question_id: id,
    answer_value: all.map(({ answer_value }) => answer_value).join(','),
  };
});

export const normalizeAnswers = (answers?: Answer[]) =>
  R.ifElse(
    R.isNil,
    R.always([]),
    R.pipe(
      R.map(R.prop('question_id')),
      R.uniq,
      R.map(combineAnswers(answers!))
    )
  )(answers!);

interface MapFetcher {
  <T>(x: T): { [K in keyof T]: any };
}

export const mapFetchData: MapFetcher = transformObjValues(R.prop('data'));
export const anyLoading = R.pipe(
  R.values,
  R.any<{ loading: boolean }>(R.prop('loading'))
);

export const findError = R.pipe<[Record<string, any>], any[], any, any>(
  R.values,
  R.find(R.prop('error')),
  R.prop('error')
);
