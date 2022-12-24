import { NextRouter } from 'next/router';
import * as R from 'ramda';

import { CategoryState } from '@/enums';
import { AppMeta } from '@/schema/AppStructure';
import {
  BackgroundImageSize,
  ColorOrBackgroundImage,
} from '@/schema/Components';
import {
  Answer,
  AnswerSummary,
  AnswerSummaryData,
  Category,
  CategoryWithProgress,
  Group,
  Option,
  Organization,
  Progress,
  Question,
} from '@/types';

export const mergeTitles = (appTitle: string, pageTitle: string) =>
  appTitle + (pageTitle ? ` - ${pageTitle}` : '');

let i = 1;

export const uniqueId = (prefix?: string) => (prefix ? `${prefix}-` : '') + i++;

/**
 * Filter by key code and run the given function if key is enter or space
 * @param fn
 */
export const onEnterOrSpace = (fn: Function) => (e: React.KeyboardEvent) => {
  if (e.code === 'Enter' || e.code === 'Space') {
    fn(e);
  }
};

type EventLike = {
  preventDefault: VoidFunction;
  stopPropagation: VoidFunction;
};

/**
 * Higher order event handler function that stops the event propagation and calls the given callback.
 * @param f
 */
export const stopPropagation = (f?: Function) => (e: EventLike) => {
  e.stopPropagation();
  f?.(e);
  return e;
};

/**
 * Filter by key code and run the given function if key is enter or space
 * @param fn
 */
export const onKeys =
  (fn: Function, ...keys: string[]) =>
  (e: React.KeyboardEvent) => {
    if (keys.includes(e.code)) {
      fn(e);
    }
  };

export const getQueryParam = (paramName: string, { query }: NextRouter) =>
  query[paramName] as string;

/**
 * Add an item to a list. If on or more existing entries are found ([comparator] returns true) then those are removed and
 * subject is added to the end of the list.
 * @param comparator
 * @param subject
 * @param list
 * @returns
 */
export const replaceOrAdd = <T>(
  comparator: (...param: any[]) => boolean,
  subject: T,
  list: T[] = []
): T[] => R.append(subject, R.without(list.filter(comparator), list));

const combineAnswers = R.curry((answers: Answer[], question_id: string) => {
  const combined = answers
    .filter(R.propEq('question_id', question_id))
    .map(R.prop('answer_value'))
    .join(',');

  return {
    question_id,
    answer_value: combined,
  };
});

/**
 * Merge category and it's progress meta information
 * @param category
 * @param progress
 * @returns
 */
export const combineCategoryWithProgress = R.curry(
  (progress: Progress, category: Category): CategoryWithProgress => {
    const categoryStatus = progress?.category_statuses.find(
      R.propEq('category_id', category.id)
    );

    return {
      ...category,
      state: R.propOr(CategoryState.LOCKED, 'state', categoryStatus),
      groupMemberCount: R.propOr(0, 'groupMemberCount', progress),
      completionCount: R.pathOr(0, ['completionCounts', category.id], progress),
    };
  }
);

/**
 * Group answers by question id combining answer values to a comma separated string
 * @param answers
 * @returns
 */
export const combineMultiAnswers = (answers: Answer[] = []) =>
  R.pipe(
    R.map(R.prop('question_id')),
    R.uniq,
    R.map(combineAnswers(answers))
  )(answers);

/**
 * Find a node containing leaf with given id
 * @private
 * @param nodes
 * @param leafId
 * @returns
 */
function findHeadNode(nodes: Organization[], leafId: string) {
  return nodes.find((head) => {
    if (head.id === leafId) {
      return head;
    }

    if (head.children) {
      const parent = findHeadNode(head.children, leafId);
      if (parent) {
        return head;
      }
    }

    return undefined;
  });
}

const findAnswerCount = (question: Question, option: Option, list: Answer[]) =>
  R.pipe<any, Answer | undefined, number>(
    R.find(R.whereEq({ question_id: question.id, answer_value: option.value })),
    R.propOr(0, 'answer_count')
  )(list);

const formAnswersWithAnswerCount = (
  question: Question,
  { answers_by_question }: AnswerSummary
) =>
  question.options.map((option) =>
    R.assoc(
      'answerCount',
      findAnswerCount(question, option, answers_by_question),
      option
    )
  );

export function formAnswerSummaryData(
  answerSummary: AnswerSummary | undefined,
  category: Category,
  answers?: Answer[]
): AnswerSummaryData {
  const questions =
    answerSummary && !R.isEmpty(answerSummary)
      ? category.questions.map((question) => {
          const answer = answers?.find(R.propEq('question_id', question.id));
          return {
            label: question.label,
            ownAnswer: answer?.answer_value,
            answers: formAnswersWithAnswerCount(question, answerSummary),
          };
        })
      : [];

  return {
    categoryLabel: category.description || '',
    questions,
  };
}

/**
 * Recursively traverse organization tree from top to bottom and form an id hierarchy as a list of ids
 * @private
 * @param entities
 * @param leafId
 * @param memo
 */
function traverseAndFormIdHierarchy(
  entities: Organization[],
  leafId: string,
  memo: string[] = []
): string[] {
  const head = findHeadNode(entities, leafId);

  if (!head) {
    return memo;
  }

  return head.children?.length
    ? traverseAndFormIdHierarchy(head.children, leafId, [...memo, head.id])
    : [...memo, head.id];
}

/**
 * Get a hierarchical id of a group, meaning an array of each parent's and grandparent's id
 * @param group
 * @returns
 */
export const getHierarchicalIdOfGroup = (
  organizations: Organization[],
  group: Group
) =>
  traverseAndFormIdHierarchy(
    organizations,
    group.parent_organization_id
  ).concat(group.id);

/**
 * Transform object values using [fn]. Keys remain the same.
 */
export const transformObjValues = R.curry(
  (fn: Function, obj: Record<string, any>) =>
    Object.fromEntries(Object.keys(obj).map((key) => [key, fn(obj[key])]))
);

/**
 * Find organizations from an organization tree by it's id
 * @param organizations
 * @param id
 * @returns
 */
export const findOrganization = (
  organizations: Organization[],
  id: string
): Organization | undefined =>
  R.find<Organization>(
    R.propEq('id', id),
    R.chain<any, any, any>(R.prop('children'), organizations)
  );

export const isLastQuestion = (questionId: string, questions: Question[]) =>
  R.pipe(R.last, R.propEq('id', questionId))(questions);

export const getAppUrlFromMeta = (appName: string, meta: AppMeta) => {
  const env = process.env.NEXT_PUBLIC_ENVNAME as string;
  return R.pathOr('#', [appName, env], meta.appUrls ?? {});
};

export const asImageDef = (value: string): ColorOrBackgroundImage => ({
  type: 'IMAGE',
  value,
});

export const asColorDef = (value: string): ColorOrBackgroundImage => ({
  type: 'COLOR',
  value,
});
