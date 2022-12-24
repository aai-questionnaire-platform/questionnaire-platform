import * as R from 'ramda';
import { ApolloClient, FetchResult, gql } from '@apollo/client/core';
import { createApolloClient } from '../api/graphql/apollo-client';
import { Category, WebinyModel } from '../types';
import { SoftDeleteService } from './soft-delete-service';
import { queryDataLens, queryErrorLens } from './lenses';
import { QuestionService } from './question-service';
import { createMutateOptions, isDraft, isPublished } from './utils';
import { QuestionnaireService } from './questionnaire-service';
import { AdminUserService } from './admin-user-service';
import { filterResults } from './graphql-utils';

export class CategoryService {
  private apolloClient: ApolloClient<any>;

  private static MAX_RESULT_LIMIT = 1000;

  static CATEGORY_PARTS = gql`
    fragment CategoryParts on Category {
      id
      entryId
      uuid
      description
      questionnaireUuid
      entryMessages
      exitMessages
      sortIndex
      gameUuid
      deletedAt
      questionnaireRevision
      backgroundColor
      backgroundImage
      image
      meta {
        status
      }
    }
  `;

  private static GET_CATEGORY = gql`
    ${CategoryService.CATEGORY_PARTS}
    query GetCategory($revision: ID!) {
      getCategory(revision: $revision) {
        data {
          ...CategoryParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static LIST_CATEGORIES_WHERE = gql`
    ${CategoryService.CATEGORY_PARTS}
    query ListCategories($where: CategoryListWhereInput) {
      listCategories(where: $where, limit: ${CategoryService.MAX_RESULT_LIMIT}) {
        data {
          ...CategoryParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static UPDATE_CATEGORY = gql`
    ${CategoryService.CATEGORY_PARTS}
    mutation UpdateCategory($revision: ID!, $data: CategoryInput!) {
      updateCategory(revision: $revision, data: $data) {
        data {
          ...CategoryParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static CREATE_CATEGORY_FROM = gql`
    ${CategoryService.CATEGORY_PARTS}
    mutation CreateCategoryFrom($revision: ID!, $data: CategoryInput!) {
      createCategoryFrom(revision: $revision, data: $data) {
        data {
          ...CategoryParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static PUBLISH_CATEGORY = gql`
    ${CategoryService.CATEGORY_PARTS}
    mutation PublishCategory($revision: ID!) {
      publishCategory(revision: $revision) {
        data {
          ...CategoryParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private static DELETE_CATEGORY = gql`
    mutation DeleteCategory($revision: ID!) {
      deleteCategory(revision: $revision) {
        data
        error {
          code
          message
        }
      }
    }
  `;

  private static GET_CATEGORY_REVISIONS = gql`
    query GetCategory($revision: ID!) {
      getCategory(revision: $revision) {
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

  async deleteCategory(revision: string) {
    console.info('deleteCategory(): Removing category', revision);

    const questionService = new QuestionService(this.userService);

    try {
      const category = await this.getCategory(revision);
      await this.setParentDraftStatus(category.questionnaireUuid);
      const questions = await questionService.listQuestionsByCategoryUuid(
        category.uuid
      );

      await Promise.all(
        questions.map(
          R.pipe(
            R.prop('id'),
            questionService.removeQuestion.bind(questionService)
          )
        )
      );

      return new SoftDeleteService().deleteModel(revision, 'Category');
    } catch (e: any) {
      console.error('deleteCategory(): Removing failed', e);
      return e;
    }
  }

  private async getCategory(revision: string): Promise<Category> {
    console.info('getCategory(): Fetching category', revision);

    const response = await this.apolloClient.query({
      query: CategoryService.GET_CATEGORY,
      variables: { revision },
    });

    if (response.error) {
      throw R.pick(['error'], response);
    }

    return R.view(queryDataLens('getCategory'), response);
  }

  private async setParentDraftStatus(questionnaireUuid: string) {
    const questionnaireService = new QuestionnaireService(this.userService);
    return questionnaireService.createDraft(questionnaireUuid);
  }

  async updateCategory(
    revision: string,
    category: Category,
    skipParentStatusUpdate = false
  ) {
    console.info(
      `updateCategory(): Updating category ${category.uuid}#${revision}`
    );
    try {
      const latestCategory = await this.getCategory(revision);

      console.info('updateCategory(): found Category', latestCategory);

      const data = isPublished(latestCategory)
        ? await this.createFromMutation(revision, category)
        : await this.updateMutation(revision, category);

      if (!skipParentStatusUpdate) {
        await this.setParentDraftStatus(latestCategory.questionnaireUuid);
      }

      return R.set(queryDataLens('updateCategory'), data, {});
    } catch (e: any) {
      console.error('updateCategory():', e);
      return R.set(
        queryErrorLens('updateCategory'),
        {
          code: 'INTERNAL_SERVER_ERROR',
          message: e.message,
        },
        {}
      );
    }
  }

  async createDraft(uuid: string) {
    const listCategoriesResponse = await this.apolloClient.query({
      query: CategoryService.LIST_CATEGORIES_WHERE,
      variables: { where: { uuid } },
    });

    const category = R.view<FetchResult, Category[]>(
      queryDataLens('listCategories'),
      listCategoriesResponse
    )[0];

    if (isPublished(category)) {
      const { variables } = createMutateOptions(
        category.id,
        R.omit(['id', 'entryId', 'meta', '__typename'], category)
      );

      const createCategoryFromResponse = await this.apolloClient.mutate({
        mutation: CategoryService.CREATE_CATEGORY_FROM,
        variables,
      });

      console.info(
        `createDraft(): Category with uuid ${uuid} status is now draft`
      );

      await this.setParentDraftStatus(category.questionnaireUuid);

      return R.view<FetchResult, Category>(
        queryDataLens('createCategoryFrom'),
        createCategoryFromResponse
      );
    }

    console.info(`createDraft(): Category with uuid ${uuid} is already draft`);
    return category;
  }

  private async updateCategoryForSort(category: Category) {
    return R.view(
      queryDataLens('updateCategory'),
      await this.updateCategory(category.id, category, true)
    );
  }

  async sortCategories(data: Category[]) {
    console.info('sortCategories():', data);

    try {
      await this.setParentDraftStatus(data[0].questionnaireUuid);
      const result = await Promise.all(
        data.map(this.updateCategoryForSort.bind(this))
      );
      return R.set(queryDataLens('sortCategories'), result, {});
    } catch (e: any) {
      return R.set(
        queryErrorLens('sortCategories'),
        {
          code: 'INTERNAL_SERVER_ERROR',
          message: e.message,
        },
        {}
      );
    }
  }

  async readCategoriesByQuestionnaireUuid(
    questionnaireUuid: string,
    filterDeleted = true
  ) {
    let categories = await this.apolloClient.query({
      query: CategoryService.LIST_CATEGORIES_WHERE,
      variables: { where: { questionnaireUuid } },
    });

    if (filterDeleted) {
      categories = filterResults(categories, this.userService.getUserGameIds());
    }

    return R.view(queryDataLens('listCategories'), categories);
  }

  async createFromMutation(revision: string, category: Category) {
    const createCategoryFromResponse = await this.apolloClient.mutate({
      mutation: CategoryService.CREATE_CATEGORY_FROM,
      variables: this.createMutationVariables(revision, category),
    });

    if (createCategoryFromResponse.errors?.length) {
      throw createCategoryFromResponse.errors;
    }

    console.log(
      'createFromMutation(): Create from prev',
      JSON.stringify(createCategoryFromResponse)
    );

    return R.view<FetchResult, Category>(
      queryDataLens('createCategoryFrom'),
      createCategoryFromResponse
    );
  }

  async updateMutation(revision: string, category: Category) {
    const updateCategoryResponse = await this.apolloClient.mutate({
      mutation: CategoryService.UPDATE_CATEGORY,
      variables: this.createMutationVariables(revision, category),
    });

    if (updateCategoryResponse.errors?.length) {
      throw updateCategoryResponse.errors;
    }

    console.log(
      'updateMutation(): Update response',
      JSON.stringify(updateCategoryResponse)
    );

    return R.view<FetchResult, Category>(
      queryDataLens('updateCategory'),
      updateCategoryResponse
    );
  }

  async deleteMutation(revision: string) {
    const deleteResponse = await this.apolloClient.mutate({
      mutation: CategoryService.DELETE_CATEGORY,
      variables: { revision },
    });

    if (deleteResponse.errors?.length) {
      throw deleteResponse.errors;
    }

    return R.view(queryDataLens('deleteCategory'), deleteResponse);
  }

  async rollbackDraftRevisions(revision: string) {
    console.log(`Rolling back categories for revision ${revision}`);

    try {
      const response = await this.apolloClient.query({
        query: CategoryService.GET_CATEGORY_REVISIONS,
        variables: { revision },
      });

      const modelRevisions = R.pathOr<WebinyModel[]>(
        [],
        ['data', 'getCategory', 'data', 'meta', 'revisions'],
        response
      );

      const drafts = modelRevisions.filter(isDraft);
      const latestPublishedRevision = modelRevisions.find(isPublished);

      console.info('Latest published revision', latestPublishedRevision);

      if (drafts.length === 1 || !latestPublishedRevision) {
        console.info(`Delete draft ${drafts[0].id}`);
        await this.deleteMutation(drafts[0].id);
      } else {
        console.info(
          `Multiple drafts found for revision ${revision}, re-publish with content of latest published model and delete drafts`
        );
        const latestPublished = await this.getCategory(
          latestPublishedRevision.id
        );
        await this.updateMutation(revision, latestPublished);
        await this.publishMutation(revision);
        await Promise.all(
          drafts
            .filter((draft) => draft.id !== revision)
            .map((draft) => this.deleteMutation(draft.id))
        );
      }

      return true;
    } catch (e) {
      console.error(`Error rolling back revision ${revision}`, e);
      throw Error(`Error rolling back revision ${revision}`);
    }
  }

  private createMutationVariables(revision: string, category: Category) {
    return createMutateOptions(
      revision,
      R.omit(['id', 'entryId', 'meta', '__typename'], category)
    ).variables;
  }

  async publishMutation(revision: string) {
    const response = await this.apolloClient.mutate({
      mutation: CategoryService.PUBLISH_CATEGORY,
      variables: { revision },
    });

    if (response.errors?.length) {
      throw response.errors;
    }

    return R.view(queryDataLens('publishCategory'), response);
  }
}
