import { ApolloClient, FetchResult, gql } from '@apollo/client/core';
import * as R from 'ramda';
import { createApolloClient } from '../api/graphql/apollo-client';
import { Questionnaire } from '../types';
import { AdminUserService } from './admin-user-service';
import { filterResults } from './graphql-utils';
import { queryDataLens } from './lenses';
import { createMutateOptions, isDraft, isPublished } from './utils';

export class QuestionnaireService {
  private apolloClient: ApolloClient<any>;

  private static MAX_RESULT_LIMIT = 1000;

  static QUESTIONNAIRE_PARTS = gql`
    fragment QuestionnaireParts on Questionnaire {
      id
      entryId
      uuid
      title
      author
      locale
      gameUuid
      editedBy
      deletedAt
      meta {
        status
        version
      }
    }
  `;

  private static LIST_QUESTIONNAIRES_BY_UUID = gql`
  ${QuestionnaireService.QUESTIONNAIRE_PARTS}
  query ListQuestionnaires($uuid: String!) {
    listQuestionnaires(where: { uuid: $uuid }, limit: ${QuestionnaireService.MAX_RESULT_LIMIT}) {
      data {
        ...QuestionnaireParts
      }
      error {
        code
        message
      }
    }
  }
  `;

  private static CREATE_QUESTIONNAIRE_FROM = gql`
    ${QuestionnaireService.QUESTIONNAIRE_PARTS}
    mutation CreateQuestionnaireFrom(
      $revision: ID!
      $data: QuestionnaireInput!
    ) {
      createQuestionnaireFrom(revision: $revision, data: $data) {
        data {
          ...QuestionnaireParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static GET_QUESTIONNAIRE = gql`
    ${QuestionnaireService.QUESTIONNAIRE_PARTS}
    query GetQuestionnaire($revision: ID!) {
      getQuestionnaire(revision: $revision) {
        data {
          ...QuestionnaireParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static PUBLISH_QUESTIONNAIRE = gql`
    ${QuestionnaireService.QUESTIONNAIRE_PARTS}
    mutation PublishQuestionnaire($revision: ID!) {
      publishQuestionnaire(revision: $revision) {
        data {
          ...QuestionnaireParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static DELETE_QUESTIONNAIRE = gql`
    mutation DeleteQuestionnaire($revision: ID!) {
      deleteQuestionnaire(revision: $revision) {
        data
        error {
          code
          message
        }
      }
    }
  `;

  private static GET_QUESTIONNAIRE_REVISIONS = gql`
    query GetQuestionnaire($revision: ID!) {
      getQuestionnaire(revision: $revision) {
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

  private static UPDATE_QUESTIONNAIRE = gql`
    ${QuestionnaireService.QUESTIONNAIRE_PARTS}
    mutation UpdateQuestionnaire($revision: ID!, $data: QuestionnaireInput!) {
      updateQuestionnaire(revision: $revision, data: $data) {
        data {
          ...QuestionnaireParts
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

  async createDraftIfPublished(questionnaire: Questionnaire) {
    if (isPublished(questionnaire)) {
      const { variables } = createMutateOptions(
        questionnaire.id,
        R.omit(['id', 'entryId', 'meta', '__typename'], questionnaire)
      );

      const createQuestionnaireFromResponse = await this.apolloClient.mutate({
        mutation: QuestionnaireService.CREATE_QUESTIONNAIRE_FROM,
        variables,
      });

      console.info(
        `Questionnaire with uuid ${questionnaire.uuid} status is now draft`
      );

      questionnaire = R.view(
        queryDataLens('createQuestionnaireFrom'),
        createQuestionnaireFromResponse
      );
    } else {
      console.info(
        `Questionnaire with uuid ${questionnaire.uuid} is already draft`
      );
    }

    return questionnaire;
  }

  async createDraft(uuid: string) {
    return this.createDraftIfPublished(
      await this.readQuestionnaireByUuid(uuid)
    );
  }

  async readQuestionnaireByUuid(uuid: string) {
    const questionnaires = await this.apolloClient.query({
      query: QuestionnaireService.LIST_QUESTIONNAIRES_BY_UUID,
      variables: { uuid },
    });

    return R.view<FetchResult, Questionnaire[]>(
      queryDataLens('listQuestionnaires'),
      filterResults(questionnaires, this.userService.getUserGameIds())
    )[0];
  }

  private async getQuestionnaire(revision: string): Promise<Questionnaire> {
    console.info('getQuestionnaire(): Fetching questionnaire', revision);

    const response = await this.apolloClient.query({
      query: QuestionnaireService.GET_QUESTIONNAIRE,
      variables: { revision },
    });

    if (response.error) {
      throw R.pick(['error'], response);
    }

    return R.view(queryDataLens('getQuestionnaire'), response);
  }

  async updateMutation(revision: string, questionnaire: Questionnaire) {
    const updateQuestionnaireResponse = await this.apolloClient.mutate({
      mutation: QuestionnaireService.UPDATE_QUESTIONNAIRE,
      variables: this.createMutationVariables(revision, questionnaire),
    });

    if (updateQuestionnaireResponse.errors?.length) {
      throw updateQuestionnaireResponse.errors;
    }

    return R.view<FetchResult, Questionnaire>(
      queryDataLens('updateQuestionnaire'),
      updateQuestionnaireResponse
    );
  }

  async deleteMutation(revision: string) {
    const deleteResponse = await this.apolloClient.mutate({
      mutation: QuestionnaireService.DELETE_QUESTIONNAIRE,
      variables: { revision },
    });

    if (deleteResponse.errors?.length) {
      throw deleteResponse.errors;
    }

    return R.view(queryDataLens('deleteQuestionnaire'), deleteResponse);
  }

  async rollbackDraftRevisions(revision: string) {
    console.log(`Rolling back questionnaires for revision ${revision}`);

    try {
      const response = R.view(
        R.lensPath(['data', 'getQuestionnaire', 'data', 'meta', 'revisions']),
        await this.apolloClient.query({
          query: QuestionnaireService.GET_QUESTIONNAIRE_REVISIONS,
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
        const latestPublished = await this.getQuestionnaire(
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

  async publishMutation(revision: string) {
    const response = await this.apolloClient.mutate({
      mutation: QuestionnaireService.PUBLISH_QUESTIONNAIRE,
      variables: { revision },
    });

    if (response.errors?.length) {
      throw response.errors;
    }

    return R.view(queryDataLens('publishQuestionnaire'), response);
  }

  private createMutationVariables(
    revision: string,
    questionnaire: Questionnaire
  ) {
    const { variables } = createMutateOptions(
      revision,
      R.omit(['id', 'entryId', 'meta', '__typename'], questionnaire)
    );
    return variables;
  }
}
