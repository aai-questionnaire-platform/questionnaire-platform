import R = require('ramda');
import {
  findAnswersFromTable,
  getAnswersFromTable,
} from '../aws-wrappers/get-item-from-table';
import { insertAnswerSetToTable } from '../aws-wrappers/insert-item-to-table';
import {
  AnswerSet,
  AnswerSetKey,
  buildAnswerSetKeyValue,
  mergeAnswerLists,
} from '../datamodels/answer-set';
import { verifyQuestionnaire } from '../datamodels/questionnaire';
import { Locale } from '../Locale';
import { QuestionnaireService } from './questionnaire-service';
import { resolveCompletedCategories } from './utils';

export class AnswersService {
  constructor(public answersTable: string) {}

  /**
   * Puts submitted answers to the table
   * @public
   * @async
   * @param questionnaireService
   * @param answersSet
   * @returns
   */
  async answerQuestionnaire(
    questionnaireService: QuestionnaireService,
    answersSet: AnswerSet
  ) {
    console.info(
      'answerQuestionnaire():',
      answersSet.key.user_id,
      'with questionnaire version',
      answersSet.questionnaire_version,
      'is answering questions',
      answersSet.answers.map(R.prop('question_id')).join(', ')
    );

    try {
      const questionnaire = await questionnaireService.getQuestionnaire(
        Locale.fi_FI
      );

      if (!verifyQuestionnaire(questionnaire, answersSet)) {
        console.error(
          'answerQuestionnaire(): Validiting submitted answers failed.'
        );
        throw new Error(
          'Validiting submitted answers failed. Verify that you specify only valid question ids and answer values.'
        );
      }

      // Seek existing answer set, if any
      const previousAnswersSet = await getAnswersFromTable(
        this.answersTable,
        'group_id',
        answersSet.key.organization_ids[0],
        'answer_id',
        buildAnswerSetKeyValue(answersSet.key)
      );

      if (previousAnswersSet) {
        // Merge with previous, it exists
        answersSet.answers = mergeAnswerLists(
          previousAnswersSet.answers,
          answersSet.answers
        );
      }

      const completedCategories = resolveCompletedCategories(
        answersSet.answers,
        questionnaire
      );

      console.info(
        'answerQuestionnaire():',
        answersSet.key.user_id,
        'has completed categories',
        completedCategories.join(', ')
      );

      return await insertAnswerSetToTable(this.answersTable, {
        ...answersSet,
        completed_categories: completedCategories,
      });
    } catch (error) {
      console.error('answerQuestionnaire', error);
      throw error;
    }
  }

  /**
   * Gets answers matching given key from the answers table
   * @public
   * @async
   * @param answerSetKey
   * @returns
   */
  async getAnswerSet(
    answerSetKey: AnswerSetKey
  ): Promise<AnswerSet | undefined> {
    return this.getAnswersWith(
      answerSetKey,
      getAnswersFromTable,
      this.getAnswerSet.name
    );
  }

  /**
   * Gets answers matching given key from the answers table
   * @public
   * @async
   * @param answerSetKey
   * @returns
   */
  async findAnswers(answerSetKey: AnswerSetKey): Promise<AnswerSet[]> {
    return (
      this.getAnswersWith(
        answerSetKey,
        findAnswersFromTable,
        this.findAnswers.name
      ) || []
    );
  }

  /**
   * Get or find answers
   * @private
   * @param answerSetKey
   * @param fnName
   * @param fn
   * @returns
   */
  private async getAnswersWith(
    answerSetKey: AnswerSetKey,
    fn: Function,
    fnName: string
  ) {
    try {
      console.info(
        `${fnName}(): Getting answers with key`,
        answerSetKey,
        'from',
        this.answersTable
      );

      const answers = await fn(
        this.answersTable,
        'group_id',
        answerSetKey.organization_ids[0],
        'answer_id',
        buildAnswerSetKeyValue(answerSetKey)
      );

      console.debug(`${fnName}(): returning `, {
        ...answers,
        answers: R.map(R.omit(['answer_value'])),
      });

      return answers;
    } catch (error) {
      console.error('Error while fetching answers', error);
      throw error;
    }
  }
}
