import { ApolloClient, gql } from '@apollo/client/core';
import * as R from 'ramda';
import { createApolloClient } from '../api/graphql/apollo-client';
import { Dto, Option } from '../types';
import { queryDataLens } from './lenses';
import { createMutateOptions, isDraft, isPublished } from './utils';
import { SoftDeleteService } from './soft-delete-service';
import { QuestionService } from './question-service';
import { AdminUserService } from './admin-user-service';
import { filterResults } from './graphql-utils';

export class OptionsService {
  private apolloClient: ApolloClient<any>;

  private static MAX_RESULT_LIMIT = 1000;

  static OPTION_PARTS = gql`
    fragment OptionParts on Option {
      id
      entryId
      uuid
      label
      value
      questionUuid
      sortIndex
      gameUuid
      deletedAt
      questionnaireRevision
      meta {
        status
      }
    }
  `;

  private static LIST_OPTIONS_WHERE = gql`
    ${OptionsService.OPTION_PARTS}
    query ListOptions($where: OptionListWhereInput) {
      listOptions(where: $where, limit: ${OptionsService.MAX_RESULT_LIMIT}) {
        data {
          ...OptionParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static CREATE_OPTION = gql`
    ${OptionsService.OPTION_PARTS}
    mutation CreateOption($data: OptionInput!) {
      createOption(data: $data) {
        data {
          ...OptionParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static UPDATE_OPTION = gql`
    ${OptionsService.OPTION_PARTS}
    mutation UpdateOption($revision: ID!, $data: OptionInput!) {
      updateOption(revision: $revision, data: $data) {
        data {
          ...OptionParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  static CREATE_OPTION_FROM = gql`
    ${OptionsService.OPTION_PARTS}
    mutation CreateOptionFrom($revision: ID!, $data: OptionInput!) {
      createOptionFrom(revision: $revision, data: $data) {
        data {
          ...OptionParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static GET_OPTION = gql`
    ${OptionsService.OPTION_PARTS}
    query GetOption($revision: ID!) {
      getOption(revision: $revision) {
        data {
          ...OptionParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static PUBLISH_OPTION = gql`
    ${OptionsService.OPTION_PARTS}
    mutation PublishOption($revision: ID!) {
      publishOption(revision: $revision) {
        data {
          ...OptionParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static DELETE_OPTION = gql`
    mutation DeleteOption($revision: ID!) {
      deleteOption(revision: $revision) {
        data
        error {
          code
          message
        }
      }
    }
  `;

  private static GET_OPTION_REVISIONS = gql`
    query GetOption($revision: ID!) {
      getOption(revision: $revision) {
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

  async listOptionsByQuestionUuid(questionUuid: string): Promise<Option[]> {
    console.info(
      "listOptionsForQuestion(): Listing options by question's uuid",
      questionUuid
    );

    const response = await this.apolloClient.query({
      query: OptionsService.LIST_OPTIONS_WHERE,
      variables: { where: { questionUuid } },
    });

    if (response.error) {
      throw response.error;
    }

    return R.view(
      queryDataLens('listOptions'),
      filterResults(response, this.userService.getUserGameIds())
    );
  }

  async createOption(option: Dto<Option>) {
    console.info(
      'createOption(): Creating option',
      option.label,
      '(',
      option.value,
      ')'
    );

    const { variables } = createMutateOptions(undefined, option);
    return this.apolloClient.mutate({
      mutation: OptionsService.CREATE_OPTION,
      variables,
    });
  }

  private async getOption(revision: string): Promise<Option> {
    console.info('getOption(): Fetching option', revision);

    const response = await this.apolloClient.query({
      query: OptionsService.GET_OPTION,
      variables: { revision },
    });

    if (response.error) {
      throw R.pick(['error'], response);
    }

    return R.view(queryDataLens('getOption'), response);
  }

  private async setParentDraftStatus(questionUuid: string) {
    const questionService = new QuestionService(this.userService);
    return questionService.createDraft(questionUuid);
  }

  async updateOption(option: Option) {
    console.info(
      'updateOption(): Updating option',
      option.label,
      option.value,
      option.id
    );

    const latestOption: any = await this.getOption(option.id);
    console.info('Found Option', latestOption);

    //For better performance, update only changed options
    if (
      option.label == latestOption.label &&
      option.sortIndex == latestOption.sortIndex
    ) {
      console.info('No changes, skipping update');
      return;
    }

    let data;
    if (isPublished(latestOption)) {
      data = await this.createFromMutation(option.id, option);
      await this.setParentDraftStatus(option.questionUuid);
    } else {
      data = await this.updateMutation(option.id, option);
    }

    return R.set(queryDataLens('updateOption'), data, {});
  }

  async removeOption(revision: string) {
    return new SoftDeleteService().deleteModel(revision, 'Option');
  }

  async readOptionsByQuestionUuids(
    questionUuid_in: Array<string>,
    filterDeleted = true
  ) {
    let options = await this.apolloClient.query({
      query: OptionsService.LIST_OPTIONS_WHERE,
      variables: { where: { questionUuid_in } },
    });
    if (filterDeleted) {
      options = filterResults(options, this.userService.getUserGameIds());
    }
    return R.view(queryDataLens('listOptions'), options);
  }

  async readOptionsByGameUuid(gameUuid: string, filterDeleted = true) {
    let options = await this.apolloClient.query({
      query: OptionsService.LIST_OPTIONS_WHERE,
      variables: { where: { gameUuid } },
    });
    if (filterDeleted) {
      options = filterResults(options, this.userService.getUserGameIds());
    }
    return R.view(queryDataLens('listOptions'), options);
  }

  async createFromMutation(revision: string, option: Option) {
    const createOptionFromResponse = await this.apolloClient.mutate({
      mutation: OptionsService.CREATE_OPTION_FROM,
      variables: this.createMutationVariables(revision, option),
    });
    if (createOptionFromResponse.errors?.length) {
      throw createOptionFromResponse.errors;
    }

    return R.view(queryDataLens('createOptionFrom'), createOptionFromResponse);
  }

  async updateMutation(revision: string, option: Option) {
    const updateOptionResponse = await this.apolloClient.mutate({
      mutation: OptionsService.UPDATE_OPTION,
      variables: this.createMutationVariables(revision, option),
    });
    if (updateOptionResponse.errors?.length) {
      throw updateOptionResponse.errors;
    }
    return R.view(queryDataLens('updateOption'), updateOptionResponse);
  }

  async deleteMutation(revision: string) {
    const deleteResponse = await this.apolloClient.mutate({
      mutation: OptionsService.DELETE_OPTION,
      variables: { revision },
    });
    if (deleteResponse.errors?.length) {
      throw deleteResponse.errors;
    }
    return R.view(queryDataLens('deleteOption'), deleteResponse);
  }

  async rollbackDraftRevisions(revision: string) {
    console.log(`Rolling back options for revision ${revision}`);

    try {
      const response = R.view(
        R.lensPath(['data', 'getOption', 'data', 'meta', 'revisions']),
        await this.apolloClient.query({
          query: OptionsService.GET_OPTION_REVISIONS,
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
        const latestPublished = await this.getOption(
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

  private createMutationVariables(revision: string, option: Option) {
    const { variables } = createMutateOptions(
      revision,
      R.omit(['id', 'entryId', 'meta', '__typename'], option)
    );
    return variables;
  }

  async publishMutation(revision: string) {
    const response = await this.apolloClient.mutate({
      mutation: OptionsService.PUBLISH_OPTION,
      variables: { revision },
    });
    if (response.errors?.length) {
      throw response.errors;
    }

    return R.view(queryDataLens('publishOption'), response);
  }
}
