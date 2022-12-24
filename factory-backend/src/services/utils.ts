import { DynamoDBRecord } from 'aws-lambda';
import { difference, last, pipe, prop, propEq } from 'ramda';
import * as R from 'ramda';

import { Answer } from '../datamodels/answer-set';
import { Category, Question, Questionnaire } from '../datamodels/questionnaire';

export const findChangedAnswersFromRecord = (record: DynamoDBRecord) => {
  const prevAnswers: Answer[] = JSON.parse(
    record?.dynamodb?.OldImage?.data.S || '[]'
  );
  const answers: Answer[] = JSON.parse(
    record?.dynamodb?.NewImage?.data.S || '[]'
  );

  return [difference(answers, prevAnswers), difference(prevAnswers, answers)];
};

const getAnswerIdFromRecord = R.pipe<DynamoDBRecord, any, string[]>(
  R.path<string>(['dynamodb', 'Keys', 'answer_id', 'S']),
  R.split('#')
);

export const getOrgIdFromRecord = (record: DynamoDBRecord) => {
  const primary_id = record.dynamodb!.Keys!.group_id.S!;
  const org_ids = getAnswerIdFromRecord(record).slice(0, -2);
  return `${primary_id}#${org_ids.join('#')}`;
};

export const getQuestionnaireIdFromRecord = R.pipe(
  getAnswerIdFromRecord,
  R.last
);

export const getUserIdFromRecord = R.pipe(getAnswerIdFromRecord, R.nth(-2));

export const getUserIdFromNewImage = (record: DynamoDBRecord): string => {
  return R.path(['dynamodb', 'NewImage', 'user_id', 'S'], record) as string;
}

export const getAttributeNameFromNewImage = (record: DynamoDBRecord): string => {
  return R.path(['dynamodb', 'NewImage', 'attribute_name', 'S'], record) as string;
}

export function resolveCompletedCategories(
  answers: Answer[],
  { categories }: Questionnaire
) {
  const getLastQuestionId = pipe<Category, Question[], Question, string>(
    prop('questions'),
    last,
    prop('id')
  );

  const getCategoryIdIfCompleted = (lastQuestionId: string, i: number) =>
    answers.find(propEq('question_id', lastQuestionId)) ? categories[i].id : '';

  return categories
    .map(getLastQuestionId)
    .map(getCategoryIdIfCompleted)
    .filter(Boolean);
}
