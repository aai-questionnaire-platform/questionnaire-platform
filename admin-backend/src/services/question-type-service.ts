import { ApolloClient, gql } from '@apollo/client/core';
import * as R from 'ramda';
import { createApolloClient } from '../api/graphql/apollo-client';
import { QuestionType } from '../types';
import { AdminUserService } from './admin-user-service';
import { filterResults } from './graphql-utils';
import { queryDataLens } from './lenses';

export class QuestionTypeService {
  private apolloClient: ApolloClient<any>;

  private static MAX_RESULT_LIMIT = 1000;

  static QUESTIONTYPE_PARTS = gql`
    fragment QuestionTypeParts on QuestionType {
      id
      entryId
      uuid
      label
      answerType
      gameUuid
      deletedAt
      meta {
        status
      }
    }
  `;

  private static LIST_QUESTIONTYPES_WHERE = gql`
  ${QuestionTypeService.QUESTIONTYPE_PARTS}
  query ListQuestionTypes($where: QuestionTypeListWhereInput) {
    listQuestionTypes(where: $where, limit: ${QuestionTypeService.MAX_RESULT_LIMIT}) {
      data {
        ...QuestionTypeParts
      }
      error {
        code
        message
      }
    }
  }`;

  private static LIST_ALL_QUESTIONTYPES = gql`
  ${QuestionTypeService.QUESTIONTYPE_PARTS}
  query ListQuestionTypes {
    listQuestionTypes(limit: ${QuestionTypeService.MAX_RESULT_LIMIT}) {
      data {
        ...QuestionTypeParts
      }
      error {
        code
        message
      }
    }
  }`;

  constructor(private userService: AdminUserService) {
    this.apolloClient = createApolloClient('manage/fi-FI');
  }

  async readQuestionTypesByGameUuid(gameUuid: string): Promise<QuestionType[]> {
    console.info(
      'readQuestionTypesByGameUuid(): Listing QuestionType by gameUuid',
      gameUuid
    );

    const response = await this.apolloClient.query({
      query: QuestionTypeService.LIST_QUESTIONTYPES_WHERE,
      variables: { where: { gameUuid } },
    });

    if (response.error) {
      throw R.pick(['error'], response);
    }

    return R.view(
      queryDataLens('listQuestionTypes'),
      filterResults(response, this.userService.getUserGameIds())
    );
  }

  async readAllQuestionTypes(): Promise<QuestionType[]> {
    console.info('readAllQuestionTypes(): Listing QuestionTypes');

    const response = await this.apolloClient.query({
      query: QuestionTypeService.LIST_ALL_QUESTIONTYPES,
    });

    if (response.error) {
      throw R.pick(['error'], response);
    }

    return R.view(
      queryDataLens('listQuestionTypes'),
      filterResults(response, this.userService.getUserGameIds())
    );
  }
}
