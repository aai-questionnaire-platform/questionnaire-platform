import { ApolloClient, gql } from '@apollo/client/core';
import * as R from 'ramda';
import { createApolloClient } from '../api/graphql/apollo-client';
import { Topic } from '../types';
import { AdminUserService } from './admin-user-service';
import { filterResults } from './graphql-utils';
import { queryDataLens } from './lenses';

export class TopicService {
  private apolloClient: ApolloClient<any>;

  private static MAX_RESULT_LIMIT = 1000;

  static TOPIC_PARTS = gql`
    fragment TopicParts on Topic {
      id
      entryId
      uuid
      label
      value
      gameUuid
      deletedAt
      meta {
        status
      }
    }
  `;

  private static LIST_TOPICS_WHERE = gql`
  ${TopicService.TOPIC_PARTS}
  query ListTopics($where: TopicListWhereInput) {
    listTopics(where: $where, limit: ${TopicService.MAX_RESULT_LIMIT}) {
      data {
        ...TopicParts
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

  async readTopicsByGameUuid(gameUuid: string): Promise<Topic[]> {
    console.info(
      'readTopicsByGameUuid(): Listing topics by gameUuid',
      gameUuid
    );

    const response = await this.apolloClient.query({
      query: TopicService.LIST_TOPICS_WHERE,
      variables: { where: { gameUuid } },
    });

    if (response.error) {
      throw R.pick(['error'], response);
    }

    return R.view(
      queryDataLens('listTopics'),
      filterResults(response, this.userService.getUserGameIds())
    );
  }
}
