import * as R from 'ramda';
import { AnswerSet } from './answer-set';

/**
 * Generic interface for questionnaires, which contain categorized option-based questions
 */
export interface Questionnaire {
  id: string; //The "primary key"
  version: number;
  author: string;
  locale: string;
  date_written: Date;
  categories: Category[];
}

export interface CategoryData {
  entryMessages?: string[];
  exitMessages?: string[];
}

/**
 * Question category, e.g. "My life"; basically a list of questions to be asked in sequence
 */
export interface Category {
  id: string; //The "primary key"
  description: string;
  questions: Question[];
  //Optional, additional data
  data: CategoryData;
  type?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  image?: string;
}

type QuestionTag = 'VALIDATE_ON_SAVE' | 'HN_REQUIRED' | 'HN_REQUIRED_GROUP';
/**
 * A question with one of more alternatives
 * Also attaches a topic
 */
export interface Question {
  id: string; //The "primary key"
  label: string;
  options: Option[];
  topic: Topic | null;
  maxSelectedOptions?: number;
  description?: string;
  tags?: QuestionTag[];
}

/**
 * Alternative with display text and separate value option (e.g. "I'm good - 5")
 */
export interface Option {
  label: string;
  value: string;
}

/**
 * Classification of a question into a broader topic, like question is related to "Health"
 */
export interface Topic {
  label: string;
  value: string;
}

export function verifyQuestionnaire(
  questionnaire: Questionnaire,
  answers: AnswerSet
): boolean {
  return answers.answers.every((answer) => {
    const category = getCategoryByQuestionId(questionnaire, answer.question_id);
    const question = category?.questions.find(
      R.propEq('id', answer.question_id)
    );

    // check that that the given answer is actually an option
    return question?.options.find(R.propEq('value', answer.answer_value));
  });
}

export function getNextCategoryId(
  questionnaire: Questionnaire,
  currentCategoryId: string
): string | undefined {
  const index =
    questionnaire.categories.map(R.prop('id')).indexOf(currentCategoryId) + 1;

  if (index < questionnaire.categories.length) {
    return questionnaire.categories[index].id;
  }

  return undefined;
}

export function getCategoryByQuestionId(
  questionnaire: Questionnaire,
  questionId: string
): Category | undefined {
  const findQuestionById = R.pipe<Category, Question[], Question | undefined>(
    R.prop('questions'),
    R.find<Question>(R.propEq('id', questionId))
  );

  return questionnaire.categories.find(findQuestionById);
}

export function groupQuestionIdsByCategory(
  questionnaire: Questionnaire,
  questionIds: string[]
): Record<string, string[]> {
  const getCategoryByQuestionIdFrom = R.partial(getCategoryByQuestionId, [
    questionnaire,
  ]);

  const findCategory = (questionId: string) => {
    const category = getCategoryByQuestionIdFrom(questionId);

    if (!category) {
      throw new Error(
        `Category id for question id ${questionId} was not found from the questionnaire!`
      );
    }

    return category.id;
  };

  return R.groupBy(findCategory, questionIds);
}
