import * as R from 'ramda';
import { getProgressFromTable } from '../aws-wrappers/get-item-from-table';
import { insertProgressToTable } from '../aws-wrappers/insert-item-to-table';
import { Answer, AnswerSet } from '../datamodels/answer-set';
import {
  CategoryState,
  CategoryStatus,
  generateDefaultProgress,
  Progress,
  ProgressWithGroupStatistics,
  updateProgress,
} from '../datamodels/progress';
import { Questionnaire } from '../datamodels/questionnaire';
import { AnswersService } from './answers-service';
import { GroupMembersService } from './group-members-service';
import { QuestionnaireService } from './questionnaire-service';

interface DataKey {
  organization_ids: string[];
  questionnaire_id: string;
  user_id: string;
}

export class ProgressService {
  constructor(public progressTableName: string) {}

  /**
   * Approves a category (makes it "unlocked" for a group)
   */
  async updateProgress(
    questionnaireService: QuestionnaireService,
    organization_ids: string[],
    category_id: string,
    questionnaire_id: string,
    state: CategoryState
  ) {
    //Verify if we have a previous progress report
    const progress = await this.getProgressWithoutAnswers(
      questionnaireService,
      questionnaire_id,
      organization_ids
    );

    console.debug(
      'updateProgress(): Updating category',
      category_id,
      'to',
      state
    );

    updateProgress(progress, category_id, state);
    return insertProgressToTable(this.progressTableName, progress);
  }

  //Gets progress without inspecting user-specific things
  async getProgressWithoutAnswers(
    questionnaireService: QuestionnaireService,
    questionnaire_id: string,
    organization_ids: string[]
  ): Promise<Progress> {
    const dataKey: DataKey = {
      organization_ids,
      user_id: '',
      questionnaire_id,
    };

    return this.fetchProgressOrDefault(dataKey, questionnaireService);
  }

  async getProgress(
    answersService: AnswersService,
    questionnaireService: QuestionnaireService,
    _groupMembersService: GroupMembersService,
    questionnaire_id: string,
    user_id: string,
    organization_ids: string[]
  ): Promise<Progress> {
    try {
      const dataKey = {
        organization_ids,
        questionnaire_id,
        user_id,
      };

      const [progress, answerSet, questionnaire] = await Promise.all([
        this.fetchProgressOrDefault(dataKey, questionnaireService),
        answersService.getAnswerSet(dataKey),
        questionnaireService.getQuestionnaire(),
      ]);

      //Update progress with user-specific info
      if (progress && answerSet?.answers) {
        console.info(
          'getProgress(): found answered category for user',
          user_id,
          'updating progress',
          progress
        );

        //Update progress to categories already answered by the user
        this.updateProgressByAnswered(
          answerSet.answers,
          questionnaire,
          progress
        );
        console.info('getProgress(): Updated progress', progress);
      }

      return progress;
    } catch (error) {
      console.error('getProgress():', error);
      throw error;
    }
  }

  async getProgressWithStatistics(
    answersService: AnswersService,
    questionnaireService: QuestionnaireService,
    groupMembersService: GroupMembersService,
    questionnaire_id: string,
    organization_ids: string[]
  ): Promise<ProgressWithGroupStatistics> {
    try {
      const dataKey = {
        organization_ids,
        questionnaire_id,
        user_id: '',
      };

      console.info(
        'getProgressWithStatistics(): Fetching progress with statistics for',
        dataKey
      );

      const [progress, answerSets, groupMembers] = await Promise.all([
        this.fetchProgressOrDefault(dataKey, questionnaireService),
        answersService.findAnswers(dataKey),
        groupMembersService.getGroupMembers(
          organization_ids[organization_ids.length - 1]
        ),
      ]);

      console.debug(
        'getProgressWithStatistics(): found following answer data',
        answerSets.map(R.pick(['key', 'completed_categories']))
      );

      return {
        ...progress,
        groupMemberCount: groupMembers.length,
        completionCounts: getCompletedCount(answerSets),
      };
    } catch (error) {
      console.error('getProgress', error);
      throw error;
    }
  }

  private updateProgressByAnswered(
    answers: Answer[],
    questionnaire: Questionnaire,
    progress: Progress
  ) {
    questionnaire.categories
      .filter(
        ({ questions }) =>
          questions.length &&
          questions.every(
            (question) => !!answers.find(R.propEq('question_id', question.id))
          )
      )
      .map(R.prop('id'))
      .filter(R.pipe(R.partial(isCategoryApproved, [progress]), R.not))
      .forEach((id) => updateProgress(progress, id, CategoryState.COMPLETED));
  }

  private async fetchProgressOrDefault(
    dataKey: DataKey,
    questionnaireService: QuestionnaireService
  ) {
    console.info(
      'fetchProgressOrDefault(): Fetching progress with key',
      JSON.stringify(dataKey)
    );

    //Seek previous progres from the server
    let progress = await getProgressFromTable(
      this.progressTableName,
      'org_id',
      dataKey.organization_ids.join('#'),
      'questionnaire_id',
      dataKey.questionnaire_id
    );

    if (!progress) {
      console.info(
        'fetchProgressOrDefault(): No previous progress found, start with default initial progress'
      );
      const categories = await questionnaireService.getCategoryIds();
      progress = generateDefaultProgress(categories);
    }

    return { ...progress, ...dataKey };
  }
}

const getCompletedCount = R.pipe<
  AnswerSet[],
  string[],
  { [categoryId: string]: number }
>(R.chain(R.propOr([], 'completed_categories')), R.countBy(R.identity));

const isCategoryApproved = (progress: Progress, id: string) =>
  R.pipe<Progress, CategoryStatus[], any, boolean>(
    R.prop('category_statuses'),
    R.find(R.propEq('category_id', id)),
    R.propEq('state', CategoryState.APPROVED)
  )(progress);
