import * as R from 'ramda';
import { Answer } from '../datamodels/answer-set';
import { ValidationError } from '../datamodels/error/validation-error';
import { Question } from '../datamodels/questionnaire';

const MIN_REQUIRED_GROUP_ANSWERS = 2;

/**
 * Validate given answers for HN application
 * @param questions
 * @param answers
 * @throws ValidationError
 * @returns
 */
export const validateHnAnswers = (questions: Question[], answers: Answer[]) => {
  if (isRequiredAnswerInvalid(questions, answers)) {
    throw new ValidationError('HN_REQUIRED');
  }

  const hasRequiredGroup = questions.find(({ tags }) =>
    tags?.includes('HN_REQUIRED_GROUP')
  );

  if (hasRequiredGroup && isRequiredGroupInvalid(questions, answers)) {
    throw new ValidationError('HN_REQUIRED_GROUP');
  }

  return undefined;
};

/**
 * Returns true if a question with tag HN_REQUIRED has an answer of 0
 * @private
 * @param questions
 * @param answers
 * @returns
 */
const isRequiredAnswerInvalid = (questions: Question[], answers: Answer[]) =>
  answers.find((answer) => {
    const question = questions.find(R.propEq('id', answer.question_id));
    return question?.tags?.includes('HN_REQUIRED') && !+answer.answer_value;
  });

/**
 * Returns true if there are not enough truthy answers to questions with tag HN_REQUIRED_GROUP
 * @private
 * @param questions
 * @param answers
 * @returns
 */
const isRequiredGroupInvalid = (questions: Question[], answers: Answer[]) =>
  R.gt(MIN_REQUIRED_GROUP_ANSWERS, countRequired(questions, answers));

const countRequired = (questions: Question[], answers: Answer[]) =>
  answers.reduce(
    (count, answer) =>
      questions
        .find(R.propEq('id', answer.question_id))
        ?.tags?.includes('HN_REQUIRED_GROUP') && !!+answer.answer_value
        ? count + 1
        : count,
    0
  );
