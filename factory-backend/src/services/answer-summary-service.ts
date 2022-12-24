import { DynamoDBRecord } from 'aws-lambda';
import * as R from 'ramda';
import { getAnswersSummaryFromTable } from '../aws-wrappers/get-item-from-table';
import { insertAnswersSummaryToTable } from '../aws-wrappers/insert-item-to-table';
import { Answer } from '../datamodels/answer-set';
import {
  addAnswer,
  AnswerSummary,
  getResponseCount,
  removeAnswer,
} from '../datamodels/answer-summary';
import { ValidationError } from '../datamodels/error/validation-error';
import {
  groupQuestionIdsByCategory,
  Questionnaire,
} from '../datamodels/questionnaire';
import {
  findChangedAnswersFromRecord,
  getOrgIdFromRecord,
  getQuestionnaireIdFromRecord,
  getUserIdFromRecord,
  resolveCompletedCategories,
} from './utils';

export class AnswerSummaryService {
  constructor(public answersSummaryTable: string) {}

  async getSummaryByMinNumberOfResponses(
    organization_ids: string[],
    questionnaire_id: string,
    category_id: string,
    minimumNumberOfResponses: number
  ): Promise<AnswerSummary | undefined> {
    console.info(
      'getSummaryByMinNumberOfResponses(): Searching summary for organization',
      organization_ids,
      'questionnaire',
      questionnaire_id,
      'category',
      category_id,
      'requiring',
      minimumNumberOfResponses,
      'completed users.'
    );

    const summaryResponse = await this.getSummary(
      questionnaire_id,
      category_id,
      organization_ids
    );

    const answerSummary = R.head(summaryResponse || []);

    console.debug(
      'getSummaryByMinNumberOfResponses(): Found',
      answerSummary,
      'for organization',
      organization_ids
    );

    if (answerSummary) {
      const responseCount = getResponseCount(answerSummary);

      if (responseCount >= minimumNumberOfResponses) {
        return answerSummary;
      }

      console.warn(
        `Not enough responses (${responseCount}) collected for the organization ${organization_ids}. Limit: ${minimumNumberOfResponses}.`
      );
    }

    return undefined;
  }

  async getSummary(
    questionnaire_id: string,
    category_id: string,
    organization_ids: string[]
  ): Promise<AnswerSummary[] | null> {
    return getAnswersSummaryFromTable(
      this.answersSummaryTable,
      'cat_id',
      `${category_id}#${questionnaire_id}`,
      'org_id',
      organization_ids.join('#')
    );
  }

  async insertSummaries(record: DynamoDBRecord, questionnaire: Questionnaire) {
    // answer_id from record is in format org1#org2#org3#userId#questionnaireId
    const questionnaire_id = getQuestionnaireIdFromRecord(record);

    if (questionnaire.id !== questionnaire_id) {
      console.error(
        'insertSummaries(): questionnaire_id in data is different from the questionnaire retrieved from the service'
      );

      throw new ValidationError(
        'ERROR: questionnaire_id in data is different from the questionnaire retrieved from the service'
      );
    }

    const org_id = getOrgIdFromRecord(record);
    const userId = getUserIdFromRecord(record);
    const [newAnswers, removedAnswers] = findChangedAnswersFromRecord(record);
    const completedCategoryIds = resolveCompletedCategories(
      newAnswers,
      questionnaire
    );

    console.info(
      'insertSummaries(): marking categories',
      completedCategoryIds.join(', ') || 'no categories',
      'completed for user',
      userId,
      'in organization',
      org_id
    );

    // Group questions by category id
    // only take changed questions in account
    const questionsByCategory = groupQuestionIdsByCategory(
      questionnaire,
      [...newAnswers, ...removedAnswers].map(R.prop('question_id'))
    );

    //Loop over the questions by category
    const answerSummaries = await this.generateSummaries(
      questionsByCategory,
      org_id,
      questionnaire,
      newAnswers,
      removedAnswers,
      userId!,
      completedCategoryIds
    );

    const answerSummaryInserts = answerSummaries.map((answerSummary) =>
      insertAnswersSummaryToTable(this.answersSummaryTable, answerSummary)
    );

    return Promise.all(answerSummaryInserts);
  }

  resolveCompletedUsers(
    completedCategoryIds: string[],
    userId: string,
    categoryId: string,
    existing?: string[]
  ) {
    return R.uniq(
      (existing || [])
        .concat(completedCategoryIds.includes(categoryId) ? userId : '')
        .filter(Boolean)
    );
  }

  async generateSummaries(
    questionsByCategory: Record<string, string[]>,
    org_id: string,
    questionnaire: Questionnaire,
    addedAnswers: Answer[],
    removedAnswers: Answer[],
    userId: string,
    completedCategoryIds: string[]
  ) {
    const answerSummaries: AnswerSummary[] = [];

    for (const categoryWithQuestion of Object.entries(questionsByCategory)) {
      const [category_id, question_ids] = categoryWithQuestion;

      //Get previous summary for the category
      const answerSummaryResult = await this.getSummary(
        questionnaire.id,
        category_id,
        org_id.split('#')
      );

      let answerSummary = answerSummaryResult?.[0];

      //Create a new one, if not found already
      if (!answerSummary) {
        answerSummary = {
          answers_by_question: [],
          category_id: category_id,
          organization_id: org_id.split('#'),
          questionnaire_id: questionnaire.id,
          completed_users: [],
        };
      }

      answerSummary.completed_users = this.resolveCompletedUsers(
        completedCategoryIds,
        userId,
        category_id,
        answerSummary.completed_users
      );

      //Loop over added answers and add them summary
      addedAnswers.forEach((newAnswer) => {
        if (question_ids.find(R.equals(newAnswer.question_id))) {
          addAnswer(
            answerSummary!,
            newAnswer.question_id,
            newAnswer.answer_value
          );
        }
      });

      //Loop over removed answers and remove them from summary
      removedAnswers.forEach((removedAnswer) => {
        if (question_ids.find(R.equals(removedAnswer.question_id))) {
          removeAnswer(
            answerSummary!,
            removedAnswer.question_id,
            removedAnswer.answer_value
          );
        }
      });

      console.debug(
        'generateSummaries(): Added',
        JSON.stringify(addedAnswers),
        'removed',
        JSON.stringify(removedAnswers)
      );

      answerSummaries.push(answerSummary);
    }

    console.debug(
      'generateSummaries(): Generated',
      JSON.stringify(answerSummaries)
    );

    return answerSummaries;
  }
}
