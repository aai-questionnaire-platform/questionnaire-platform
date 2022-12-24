export interface AnswerSummary {
  questionnaire_id: string;
  organization_id: string[]; // Ids of organizations, starting from highest, e.g. [9, 99, 999]
  category_id: string;
  answers_by_question: AnswerCount[]; // This is in format ["X:Y=Z", ...] Z answers with value Y for question X
  completed_users?: string[];
}

/**
 * Represents an answer linked to a question in questionnaire
 */
export interface AnswerCount {
  question_id: string;
  answer_value: any;
  answer_count: number;
}

/**
 * Parses the encoded string question_id:answer_value=count,question_id:answer_value=count into array of AnswerCount-objects
 * @param encoded
 * @returns
 */
export function answerCountFromString(encoded: string): AnswerCount[] {
  return encoded.split(',').map((element) => {
    // element is formatted as 1:2=3 where 1 is question's id, 2 is answer's value and 3 is total
    const [question_id, answer_value, answer_count] = element.split(/[:|=]/);
    return {
      answer_count: +answer_count,
      answer_value: answer_value,
      question_id: question_id,
    };
  });
}

/**
 * Encodes the answer count array into a comma separated string
 * @param answerCounts
 * @returns
 */
export function answerCountToString(answerCounts: AnswerCount[]): string {
  return answerCounts
    .map((a) => a.question_id + ':' + a.answer_value + '=' + a.answer_count)
    .join(',');
}

/**
 * Adds an answer to a question with same value. Increments counter if necessary.
 * @param answers
 * @param question_id
 * @param answer_value
 */
export function addAnswer(
  answers: AnswerSummary,
  question_id: string,
  answer_value: string
) {
  var previous = answers.answers_by_question.find(
    (a) => a.question_id === question_id && a.answer_value === answer_value
  );
  if (previous) {
    previous.answer_count = +previous.answer_count + +1;
  } else {
    answers.answers_by_question.push({
      question_id: question_id,
      answer_value: answer_value,
      answer_count: 1,
    });
  }
}

/**
 * Adds an answer to a question with same value. Increments counter if necessary.
 * @param answers
 * @param question_id
 * @param answer_value
 */
export function removeAnswer(
  answers: AnswerSummary,
  question_id: string,
  answer_value: string
) {
  const previous = answers.answers_by_question.find(
    (a) => a.question_id === question_id && a.answer_value === answer_value
  );

  if (previous) {
    previous.answer_count = +previous.answer_count - 1;
  } else {
    console.warn('removeAnswer(): Trying to remove non-existing answer');
  }
}

/**
 * Count how many have responded; this is done by calculating a max sum
 * of different responses to same question
 * @param answerSummary
 * @returns
 */
export function getResponseCount(answerSummary: AnswerSummary): number {
  return answerSummary.completed_users?.length || 0;
}
