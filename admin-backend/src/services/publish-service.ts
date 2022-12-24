import * as R from 'ramda';
import { GameInstance } from '../datamodels/game-instance';
import {
  Category,
  Option,
  Question,
  Questionnaire,
  QuestionType,
  Topic,
  WebinyModel,
} from '../types';
import { AdminUserService } from './admin-user-service';
import { CategoryService } from './category-service';
import { queryDataLens } from './lenses';
import { OptionsService } from './options-service';
import { QuestionGameService } from './question-game-service';
import { QuestionService } from './question-service';
import { QuestionTypeService } from './question-type-service';
import { QuestionnaireService } from './questionnaire-service';
import { TopicService } from './topic-service';
import { createTimestampWithTimezone, isDraft, isPublished } from './utils';

export interface QuestionnaireContent {
  questionnaire: Questionnaire;
  categories: Array<Category>;
  questions: Array<Question>;
  options: Array<Option>;
}

export class PublishService {
  private contentToPublish = {} as QuestionnaireContent;
  private publishedContent = {} as QuestionnaireContent;

  private questionnaireService: QuestionnaireService;
  private categoryService: CategoryService;
  private questionService: QuestionService;
  private optionService: OptionsService;
  private topicService: TopicService;
  private questionTypeService: QuestionTypeService;

  private topics: Array<Topic>;
  private questionTypes: Array<QuestionType>;

  constructor(
    private userService: AdminUserService,
    private gameInstance: GameInstance
  ) {
    this.questionnaireService = new QuestionnaireService(userService);
    this.categoryService = new CategoryService(userService);
    this.questionService = new QuestionService(userService);
    this.optionService = new OptionsService(userService);
    this.topicService = new TopicService(userService);
    this.questionTypeService = new QuestionTypeService(userService);
  }

  async rollbackQuestionnaireChanges(data: any) {
    if (!data.questionnaireUuid) {
      throw Error('Missing required parameter: questionnaireUuid');
    }

    if (!data.editedBy) {
      throw Error('Missing required parameter: editedBy');
    }

    try {
      await this.initQuestionnaireModels(data.questionnaireUuid);

      console.info(
        `Rolling back models for questionnaire ${this.contentToPublish.questionnaire.id}`
      );

      await Promise.all(
        R.flatten([
          this.contentToPublish.options
            .filter(isDraft)
            .map((option) =>
              this.optionService.rollbackDraftRevisions(option.id)
            ),

          this.contentToPublish.questions
            .filter(isDraft)
            .map((question) =>
              this.questionService.rollbackDraftRevisions(question.id)
            ),

          this.contentToPublish.categories
            .filter(isDraft)
            .map((category) =>
              this.categoryService.rollbackDraftRevisions(category.id)
            ),
        ])
      );

      if (isDraft(this.contentToPublish.questionnaire)) {
        await this.questionnaireService.rollbackDraftRevisions(
          this.contentToPublish.questionnaire.id
        );
      }

      console.info(
        `rollback done for questionnaire revision ${this.contentToPublish.questionnaire.id}`
      );
    } catch (e) {
      console.error(
        `Error rolling back changes for questionnaire ${data.questionnaireUuid}`
      );
      console.error(e);
      throw Error('Rollback was not succesfull, see logs for details');
    }

    return R.set(queryDataLens('rollbackQuestionnaire'), true, {});
  }

  async publishQuestionnaire(data: any) {
    if (!data.questionnaireUuid) {
      throw Error('Missing required parameter: questionnaireUuid');
    } else if (!data.editedBy) {
      throw Error('Missing required parameter: editedBy');
    }

    await this.initQuestionnaireModels(data.questionnaireUuid);

    this.contentToPublish.questionnaire =
      await this.questionnaireService.createDraftIfPublished(
        this.contentToPublish.questionnaire
      );

    const questionnaireRevision = this.contentToPublish.questionnaire.id;

    const [updatedCategories, updatedQuestions, updatedOptions] =
      await Promise.all([
        this.updateUnpublishedCategories(
          questionnaireRevision,
          this.contentToPublish.categories
        ),
        this.updateUnpublishedQuestions(
          questionnaireRevision,
          this.contentToPublish.questions
        ),
        this.updateUnpublishedOptions(
          questionnaireRevision,
          this.contentToPublish.options
        ),
      ]);

    const categoriesToPublish = updatedCategories;
    const questionsToPublish = updatedQuestions;
    const optionsToPublish = updatedOptions;

    console.info('Starting publish mutations');
    //Publish
    const [publishedCategories, publishedQuestions, publishedOptions] =
      await Promise.all([
        this.publishCategories(categoriesToPublish),
        this.publishQuestions(questionsToPublish),
        this.publishOptions(optionsToPublish),
      ]);

    this.publishedContent.categories = <Category[]>publishedCategories;
    this.publishedContent.questions = <Question[]>publishedQuestions;
    this.publishedContent.options = <Option[]>publishedOptions;

    this.publishedContent.questionnaire =
      await this.questionnaireService.publishMutation(
        this.contentToPublish.questionnaire.id
      );
    console.debug('mutations ready');

    console.info(
      'Changed content published in this revision',
      JSON.stringify(this.publishedContent, null, 1)
    );

    await this.publishJson();

    console.debug(
      'Questionnaire published with id ' +
        this.publishedContent.questionnaire.id
    );
    return R.set(
      queryDataLens('publishQuestionnaire'),
      { id: this.publishedContent.questionnaire.id },
      {}
    );
  }

  private createUpdateParams(
    questionnaireRevision: string,
    models: Array<any>
  ) {
    const content = models.map((model) => ({
      ...model,
      questionnaireRevision,
    }));

    return {
      draft: content.filter(isDraft),
      published: content.filter(isPublished),
    };
  }

  private async updateUnpublishedCategories(
    questionnaireRevision: string,
    categories: Array<Category>
  ) {
    const params = this.createUpdateParams(questionnaireRevision, categories);
    return Promise.all(
      R.flatten([
        params.draft.map((category) =>
          this.categoryService.updateMutation(category.id, category)
        ),
      ])
    );
  }

  private async updateUnpublishedQuestions(
    questionnaireRevision: string,
    questions: Array<Question>
  ) {
    const params = this.createUpdateParams(questionnaireRevision, questions);
    return Promise.all(
      R.flatten([
        params.draft.map((question) =>
          this.questionService.updateMutation(question.id, question)
        ),
      ])
    );
  }

  private async updateUnpublishedOptions(
    questionnaireRevision: string,
    options: Array<Option>
  ) {
    const params = this.createUpdateParams(questionnaireRevision, options);
    return Promise.all(
      R.flatten([
        params.draft.map((option) =>
          this.optionService.updateMutation(option.id, option)
        ),
      ])
    );
  }

  private async publishCategories(categories: Array<Category>) {
    return Promise.all(
      categories.map((category) =>
        this.categoryService.publishMutation(category.id)
      )
    );
  }

  private async publishQuestions(questions: Array<Question>) {
    return Promise.all(
      questions.map((question) =>
        this.questionService.publishMutation(question.id)
      )
    );
  }

  private async publishOptions(options: Array<Option>) {
    return Promise.all(
      options.map((option) => this.optionService.publishMutation(option.id))
    );
  }

  private checkUserIsAuthorizedToPublish(model: any) {
    return model != null && this.userService.userHasGame(model.gameUuid);
  }

  private async initQuestionnaireModels(questionnaireUuid: string) {
    console.info(
      `initQuestionnaireModels() with questionnaireUuid ${questionnaireUuid}`
    );
    this.contentToPublish.questionnaire =
      await this.questionnaireService.readQuestionnaireByUuid(
        questionnaireUuid
      );
    const gameUuid: string = <string>(
      this.contentToPublish.questionnaire.gameUuid
    );
    if (
      this.checkUserIsAuthorizedToPublish(this.contentToPublish.questionnaire)
    ) {
      const [categories, questions, options, topics, questionTypes] =
        await Promise.all([
          this.categoryService.readCategoriesByQuestionnaireUuid(
            this.contentToPublish.questionnaire.uuid,
            false
          ),
          this.questionService.readQuestionsByGameUuid(gameUuid, false),
          this.optionService.readOptionsByGameUuid(gameUuid, false),
          this.topicService.readTopicsByGameUuid(gameUuid),
          this.questionTypeService.readAllQuestionTypes(),
        ]);

      this.contentToPublish.categories =
        this.filterDeletedAndPublished<Category>(categories);

      this.contentToPublish.questions =
        this.filterDeletedAndPublished<Question>(questions);

      this.contentToPublish.options =
        this.filterDeletedAndPublished<Option>(options);

      this.topics = topics;

      this.questionTypes = questionTypes;

      console.info(
        'Content before publish',
        JSON.stringify(this.contentToPublish, null, 1)
      );
      console.info('topics', JSON.stringify(this.topics, null, 1));
      console.info(
        'questionTypes',
        JSON.stringify(this.questionTypes, null, 1)
      );
    } else {
      throw new Error('User not authorized to publish questionnaire');
    }
  }

  private async publishJson() {
    try {
      const json = this.getQuestionnaireJson();
      const questionGameService = new QuestionGameService(this.gameInstance);
      console.info(
        'Json created, posting to game-backend',
        JSON.stringify(json, null, 1)
      );
      await questionGameService.postQuestionnaire(json);
      console.info('Json published');
      return json;
    } catch (e) {
      console.error('Error publishing questionnaire-json to game api', e);
      throw e;
    }
  }

  private getQuestionnaireJson() {
    return {
      $schema:
        'https://mmk-openapi-hosting.s3.eu-west-1.amazonaws.com/questionnaire.json',
      title: this.publishedContent.questionnaire.title,
      author: this.publishedContent.questionnaire.author,
      date_written: createTimestampWithTimezone(),
      id: this.publishedContent.questionnaire.uuid,
      version: this.publishedContent.questionnaire.meta.version,
      locale: this.publishedContent.questionnaire.locale,
      categories: this.getCategoriesJson(),
    };
  }

  private filterDeletedAndPublished<T extends WebinyModel>(models: Array<T>) {
    return models.filter(
      (model) => !model.deletedAt || (!!model.deletedAt && isDraft(model))
    );
  }

  private filterDeleted<T extends WebinyModel>(models: Array<T>) {
    return models.filter((model) => !model.deletedAt);
  }

  private getCategoriesJson() {
    return this.filterDeleted<Category>(this.contentToPublish.categories)
      .sort((a, b) => a.sortIndex - b.sortIndex)
      .map((category) => {
        return {
          id: category.uuid,
          description: category.description,
          data: {
            entryMessages: (category.entryMessages ?? []).filter(Boolean),
            exitMessages: (category.exitMessages ?? []).filter(Boolean),
          },
          questions: this.getQuestionsJson(category.uuid),
          backgroundColor: category.backgroundColor ?? undefined,
          backgroundImage: category.backgroundImage ?? undefined,
          image: category.image ?? undefined,
        };
      });
  }

  private getQuestionsJson(categoryUuid: string) {
    const withDeleted = this.contentToPublish.questions.filter(
      R.propEq('categoryUuid', categoryUuid)
    );

    return this.filterDeleted<Question>(withDeleted)
      .sort((a, b) => a.sortIndex - b.sortIndex)
      .map((question) => {
        const questionJson: any = {
          id: question.uuid,
          label: question.label,
          topic: this.getTopicJson(question.topicUuid),
          options: this.getOptionsJson(question.uuid),
          ...(question.tags &&
            question.tags.length > 0 && { tags: question.tags }),
        };

        if (this.isMultipleAnswerQuestion(question.typeUuid)) {
          questionJson.description = 'You can select multiple options'; //TODO: this should come from ui?
          questionJson.maxSelectedOptions = questionJson.options.length;
        }

        return questionJson;
      });
  }

  private getOptionsJson(questionUuid: string) {
    const withDeleted = this.contentToPublish.options.filter(
      R.propEq('questionUuid', questionUuid)
    );

    return this.filterDeleted(withDeleted)
      .sort((a, b) => a.sortIndex - b.sortIndex)
      .map(R.pick(['label', 'value']));
  }

  private isMultipleAnswerQuestion(questionTypeUuid: string) {
    const questionType = this.questionTypes.find(
      (questionType) => questionType.uuid === questionTypeUuid
    );

    if (!questionType) {
      throw Error(`QuestionType with uuid ${questionTypeUuid} not found`);
    }

    return questionType?.answerType === 'multiple';
  }

  private getTopicJson(topicUuid?: string) {
    if (topicUuid) {
      const topic = this.topics.find((topic) => topic.uuid === topicUuid);

      if (!topic) {
        throw Error(`Topic with uuid ${topicUuid} not found`);
      }

      return {
        label: topic.label,
        value: topic.value,
      };
    }

    return null;
  }
}
