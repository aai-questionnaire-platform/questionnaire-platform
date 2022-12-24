import { ApolloClient, gql } from '@apollo/client/core';
import * as R from 'ramda';
import { createApolloClient } from '../api/graphql/apollo-client';
import {
  CreateQuestionPayload,
  Dto,
  Option,
  Question,
  UpdateQuestionPayload,
} from '../types';
import { AdminUserService } from './admin-user-service';
import { CategoryService } from './category-service';
import { filterResults } from './graphql-utils';
import { queryDataLens } from './lenses';
import { OptionsService } from './options-service';
import { SoftDeleteService } from './soft-delete-service';
import { createMutateOptions, isDraft, isPublished } from './utils';

export class QuestionService {
  private apolloClient: ApolloClient<any>;

  private static MAX_RESULT_LIMIT = 1000;

  static QUESTION_PARTS = gql`
    fragment QuestionParts on Question {
      id
      entryId
      uuid
      label
      typeUuid
      topicUuid
      categoryUuid
      gameUuid
      sortIndex
      deletedAt
      tags
      questionnaireRevision
      meta {
        status
      }
    }
  `;

  private static LIST_QUESTIONS_WHERE = gql`
  ${QuestionService.QUESTION_PARTS}
  query ListQuestions($where: QuestionListWhereInput) {
    listQuestions(where: $where, limit: ${QuestionService.MAX_RESULT_LIMIT}) {
      data {
        ...QuestionParts
      }
      error {
        code
        message
      }
    }
  }
`;

  private static GET_QUESTION = gql`
    ${QuestionService.QUESTION_PARTS}
    query GetQuestion($revision: ID!) {
      getQuestion(revision: $revision) {
        data {
          ...QuestionParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static CREATE_QUESTION = gql`
    ${QuestionService.QUESTION_PARTS}
    mutation CreateQuestion($data: QuestionInput!) {
      createQuestion(data: $data) {
        data {
          ...QuestionParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  static UPDATE_QUESTION = gql`
    ${QuestionService.QUESTION_PARTS}
    mutation UpdateQuestion($revision: ID!, $data: QuestionInput!) {
      updateQuestion(revision: $revision, data: $data) {
        data {
          ...QuestionParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  static CREATE_QUESTION_FROM = gql`
    ${QuestionService.QUESTION_PARTS}
    mutation CreateQuestionFrom($revision: ID!, $data: QuestionInput!) {
      createQuestionFrom(revision: $revision, data: $data) {
        data {
          ...QuestionParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static PUBLISH_QUESTION = gql`
    ${QuestionService.QUESTION_PARTS}
    mutation PublishQuestion($revision: ID!) {
      publishQuestion(revision: $revision) {
        data {
          ...QuestionParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static DELETE_QUESTION = gql`
    mutation DeleteQuestion($revision: ID!) {
      deleteQuestion(revision: $revision) {
        data
        error {
          code
          message
        }
      }
    }
  `;

  private static GET_QUESTION_REVISIONS = gql`
    query GetQuestion($revision: ID!) {
      getQuestion(revision: $revision) {
        data {
          meta {
            revisions {
              id
              meta {
                status
              }
            }
          }
        }
        error {
          code
          message
        }
      }
    }
  `;

  constructor(private userService: AdminUserService) {
    this.apolloClient = createApolloClient('manage/fi-FI');
  }

  async listQuestionsByCategoryUuid(categoryUuid: string): Promise<Question[]> {
    console.info(
      "listQuestionsByCategoryUuid(): Listing question by category's uuid",
      categoryUuid
    );

    const response = await this.apolloClient.query({
      query: QuestionService.LIST_QUESTIONS_WHERE,
      variables: { where: { categoryUuid } },
    });

    if (response.error) {
      throw R.pick(['error'], response);
    }

    return R.view(queryDataLens('listQuestions'), response);
  }

  async createQuestion(payload: CreateQuestionPayload) {
    console.info(
      'createQuestion(): Creating question',
      payload.label,
      '(',
      payload.uuid,
      ')'
    );

    try {
      const { options, ...question } = payload;
      const { variables } = createMutateOptions(undefined, question);

      const createQuestionResponse = await this.apolloClient.mutate({
        mutation: QuestionService.CREATE_QUESTION,
        variables,
      });

      if (options.length) {
        await this.handleOptions(options, question);
      }

      await this.setParentDraftStatus(question.categoryUuid);

      return createQuestionResponse;
    } catch (e) {
      console.error('createQuestion():', e);
      return {
        error: {
          code: '',
          message: e,
        },
      };
    }
  }

  async createDraft(uuid: string) {
    const response = await this.apolloClient.query({
      query: QuestionService.LIST_QUESTIONS_WHERE,
      variables: { where: { uuid } },
    });
    let question = R.view(queryDataLens('listQuestions'), response)[0];

    if (isPublished(question)) {
      const { variables } = createMutateOptions(
        question.id,
        R.omit(['id', 'entryId', 'meta', '__typename'], question)
      );

      const createQuestionFromResponse = await this.apolloClient.mutate({
        mutation: QuestionService.CREATE_QUESTION_FROM,
        variables,
      });

      console.info(`Question with uuid ${uuid} status is now draft`);
      await this.setParentDraftStatus(question.categoryUuid);

      question = R.view(
        queryDataLens('createQuestionFrom'),
        createQuestionFromResponse
      );
    } else {
      console.info(`Question with uuid ${uuid} is already draft`);
    }
    return question;
  }

  private async setParentDraftStatus(categoryUuid: string) {
    const categoryService = new CategoryService(this.userService);
    return categoryService.createDraft(categoryUuid);
  }

  async updateQuestion(
    revision: string,
    payload: UpdateQuestionPayload,
    skipHandleOptions: boolean,
    skipParentStatusUpdate: boolean
  ) {
    console.info(
      'updateQuestion(): Updating question',
      payload.label,
      revision,
      payload.uuid
    );
    console.info('payload', payload);

    try {
      const { options, ...question } = payload;

      const latestQuestion: any = await this.getQuestion(revision);
      console.info('Found Question', latestQuestion);

      let data;
      if (isPublished(latestQuestion)) {
        console.info('Published Question, creating new');
        data = await this.createFromMutation(revision, question);
      } else {
        console.log('Draft Question, update existing');
        data = await this.updateMutation(revision, question);
      }

      if (!skipParentStatusUpdate) {
        await this.setParentDraftStatus(latestQuestion.categoryUuid);
      }

      if (!skipHandleOptions) {
        await this.handleOptions(options, question);
      } else {
        console.info('Skip handling options');
      }
      console.info('data after update', data);

      return {
        data: {
          updateQuestion: {
            data: data,
            error: null,
          },
        },
      };
    } catch (e) {
      console.error('updateQuestion():', e);
      return {
        error: {
          code: '',
          message: e,
        },
      };
    }
  }

  async removeQuestion(revision: string) {
    console.info('removeQuestion(): Removing question', revision);

    const optionsService = new OptionsService(this.userService);
    const deleteService = new SoftDeleteService();

    try {
      const question = await this.getQuestion(revision);
      await this.setParentDraftStatus(question.categoryUuid);
      const options = await optionsService.listOptionsByQuestionUuid(
        question.uuid
      );

      await Promise.all(
        options.map(
          R.pipe(R.prop('id'), optionsService.removeOption.bind(optionsService))
        )
      );

      return deleteService.deleteModel(revision, 'Question');
    } catch (e) {
      console.error('removeQuestion(): Removing failed', e);
      return e;
    }
  }

  private async getQuestion(revision: string): Promise<Question> {
    console.info('getQuestion(): Fetching question', revision);

    const response = await this.apolloClient.query({
      query: QuestionService.GET_QUESTION,
      variables: { revision },
    });

    if (response.error) {
      throw R.pick(['error'], response);
    }

    return R.view(queryDataLens('getQuestion'), response);
  }

  private async handleOptions(
    options: (Option | Dto<Option>)[],
    question: Question | Dto<Question>
  ) {
    const optionsService = new OptionsService(this.userService);
    const optionsFromDb = await optionsService.listOptionsByQuestionUuid(
      question.uuid
    );

    // options that should be updated have an entryId set and those not yet created don't
    const [existingOptions, newOptions] = R.partition(
      R.propSatisfies(R.complement(R.isNil), 'entryId'),
      options
    );

    // remove all existing options that are missing from the received options list
    const removedQuestions = R.differenceWith(
      R.eqProps('uuid'),
      optionsFromDb,
      existingOptions
    );

    // add gameId from parent-model if it is not set (new models)
    const newOptionsWithGameUuid = newOptions.map(
      R.assoc('gameUuid', question.gameUuid)
    );

    return Promise.all(
      R.flatten([
        R.map(
          optionsService.createOption.bind(optionsService),
          newOptionsWithGameUuid
        ),
        R.map(
          optionsService.updateOption.bind(optionsService),
          existingOptions as Option[]
        ),
        R.map(
          optionsService.removeOption.bind(optionsService),
          R.map(R.prop('id'), removedQuestions)
        ),
      ])
    );
  }

  async updateQuestionWithoutHandlingOptions(question: Question) {
    return this.updateQuestion(
      question.id,
      <UpdateQuestionPayload>question,
      true,
      true
    );
  }

  async sortQuestions(data: Question[]) {
    console.info('sortQuestions():', data);

    try {
      await this.setParentDraftStatus(data[0].categoryUuid);
      const result = await Promise.all(
        data.map(this.updateQuestionWithoutHandlingOptions.bind(this))
      );

      const mappedResult = result.map(R.view(queryDataLens('updateQuestion')));

      return { data: { sortQuestions: { data: mappedResult, error: null } } };
    } catch (e: any) {
      return {
        data: {
          sortQuestions: {
            data: null,
            error: {
              code: '',
              message: e.message,
            },
          },
        },
      };
    }
  }

  async readQuestionsByCategoryUuids(
    categoryUuid_in: Array<string>,
    filterDeleted = true
  ) {
    let questions = await this.apolloClient.query({
      query: QuestionService.LIST_QUESTIONS_WHERE,
      variables: { where: { categoryUuid_in } },
    });
    if (filterDeleted) {
      questions = filterResults(questions, this.userService.getUserGameIds());
    }
    return R.view(queryDataLens('listQuestions'), questions);
  }

  async readQuestionsByGameUuid(gameUuid: string, filterDeleted = true) {
    let questions = await this.apolloClient.query({
      query: QuestionService.LIST_QUESTIONS_WHERE,
      variables: { where: { gameUuid } },
    });
    if (filterDeleted) {
      questions = filterResults(questions, this.userService.getUserGameIds());
    }
    return R.view(queryDataLens('listQuestions'), questions);
  }

  async createFromMutation(revision: string, question: Question) {
    const createQuestionFromResponse = await this.apolloClient.mutate({
      mutation: QuestionService.CREATE_QUESTION_FROM,
      variables: this.createMutationVariables(revision, question),
    });
    if (createQuestionFromResponse.errors?.length) {
      throw createQuestionFromResponse.errors;
    }

    return R.view(
      queryDataLens('createQuestionFrom'),
      createQuestionFromResponse
    );
  }

  async updateMutation(revision: string, question: Question) {
    const updateQuestionResponse = await this.apolloClient.mutate({
      mutation: QuestionService.UPDATE_QUESTION,
      variables: this.createMutationVariables(revision, question),
    });
    if (updateQuestionResponse.errors?.length) {
      throw updateQuestionResponse.errors;
    }
    return R.view(queryDataLens('updateQuestion'), updateQuestionResponse);
  }

  async deleteMutation(revision: string) {
    const deleteResponse = await this.apolloClient.mutate({
      mutation: QuestionService.DELETE_QUESTION,
      variables: { revision },
    });
    if (deleteResponse.errors?.length) {
      throw deleteResponse.errors;
    }
    return R.view(queryDataLens('deleteQuestion'), deleteResponse);
  }

  async rollbackDraftRevisions(revision: string) {
    console.log(`Rolling back questions for revision ${revision}`);

    try {
      const response = R.view(
        R.lensPath(['data', 'getQuestion', 'data', 'meta', 'revisions']),
        await this.apolloClient.query({
          query: QuestionService.GET_QUESTION_REVISIONS,
          variables: { revision },
        })
      );

      const drafts = response.filter(isDraft);

      const latestPublishedRevision = response.find(isPublished);
      console.info('Latest published revision', latestPublishedRevision);

      if (drafts.length === 1 || !latestPublishedRevision) {
        console.info(`Delete draft ${drafts[0].id}`);
        await this.deleteMutation(drafts[0].id);
      } else {
        console.info(
          `Multiple drafts found for revision ${revision}, re-publish with content of latest published model and delete drafts`
        );
        const latestPublished = await this.getQuestion(
          latestPublishedRevision.id
        );
        await this.updateMutation(revision, latestPublished);
        await this.publishMutation(revision);
        await Promise.all(
          drafts
            .filter((draft: any) => draft.id !== revision)
            .map((draft: any) => {
              return this.deleteMutation(draft.id);
            })
        );
      }
      return true;
    } catch (e) {
      console.error(`Error rolling back revision ${revision}`, e);
      throw Error(`Error rolling back revision ${revision}`);
    }
  }

  private createMutationVariables(revision: string, question: Question) {
    if (question.tags === null) {
      question.tags = [];
    }
    const { variables } = createMutateOptions(
      revision,
      R.omit(['id', 'entryId', 'meta', '__typename'], question)
    );
    return variables;
  }

  async publishMutation(revision: string) {
    const response = await this.apolloClient.mutate({
      mutation: QuestionService.PUBLISH_QUESTION,
      variables: { revision },
    });
    if (response.errors?.length) {
      throw response.errors;
    }

    return R.view(queryDataLens('publishQuestion'), response);
  }
}
