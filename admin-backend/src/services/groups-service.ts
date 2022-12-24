import { ApolloClient, gql } from '@apollo/client/core';
import * as R from 'ramda';
import { createApolloClient } from '../api/graphql/apollo-client';
import { GameInstance } from '../datamodels/game-instance';
import { Group, PostGroupPayload, User } from '../types';
import { QuestionGameService } from './question-game-service';
import { UserService } from './user-service';
import {
  addToStringSet,
  createMutateOptions,
  createTimestampWithTimezone,
  isInList,
} from './utils';

export class GroupsService {
  GROUP_PARTS = gql`
    fragment GroupParts on Group {
      id
      entryId
      uuid
      name
      validFrom
      validUntil
      organizationUuid
      pin
      deletedAt
      gameUuid
    }
  `;

  LIST_GROUPS_WHERE = gql`
    ${this.GROUP_PARTS}
    query ListGroups($where: GroupListWhereInput) {
      listGroups(where: $where) {
        data {
          ...GroupParts
        }
        error {
          code
          message
          data
        }
      }
    }
  `;

  CREATE_GROUP = gql`
    ${this.GROUP_PARTS}
    mutation CreateGroup($data: GroupInput!) {
      createGroup(data: $data) {
        data {
          ...GroupParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  CREATE_GROUP_FROM = gql`
    ${this.GROUP_PARTS}
    mutation CreateGroupFrom($revision: ID!, $data: GroupInput!) {
      createGroupFrom(revision: $revision, data: $data) {
        data {
          ...GroupParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  PUBLISH_GROUP = gql`
    ${this.GROUP_PARTS}
    mutation PublishGroup($revision: ID!) {
      publishGroup(revision: $revision) {
        data {
          ...GroupParts
        }
        error {
          code
          message
        }
      }
    }
  `;

  private apolloClient: ApolloClient<any>;
  private questionGameService: QuestionGameService;
  private userService: UserService;

  constructor(gameInstance: GameInstance) {
    this.apolloClient = createApolloClient('manage/fi-FI');
    this.questionGameService = new QuestionGameService(gameInstance);

    this.userService = new UserService(
      <string>process.env['AWS_ACCESS_KEY_ID'],
      <string>process.env['AWS_SECRET_ACCESS_KEY'],
      <string>process.env['AWS_SESSION_TOKEN'],
      gameInstance,
      'eu-west-1'
    );
  }

  async updateAndPublishGroup(revision: string, groupDto: PostGroupPayload) {
    console.info('updateAndPublishGroup(): Updating group', revision);
    console.debug(
      'updateAndPublishGroup(): Updating group',
      JSON.stringify(groupDto)
    );

    try {
      const group = R.assoc('id', revision, R.omit(['groupAdmins'], groupDto));
      const variables = this.getGroupInputParams(group);

      await this.handleGroupAdmins(groupDto);

      const updateGroupResponse = await this.apolloClient.mutate({
        mutation: this.CREATE_GROUP_FROM,
        variables: variables.variables,
      });

      const createdGroup = <Group>updateGroupResponse.data.createGroupFrom.data;

      await this.putGroupToGameApi(createdGroup);

      const publishGroupResponse = await this.apolloClient.mutate({
        mutation: this.PUBLISH_GROUP,
        variables: {
          revision: updateGroupResponse.data.createGroupFrom.data.id,
        },
      });

      return {
        data: {
          updateAndPublishGroup: {
            data: {
              ...publishGroupResponse.data.publishGroup.data,
              groupAdmins: groupDto.groupAdmins,
            },
            error: null,
            __typename: 'GroupResponse',
          },
        },
      };
    } catch (e: any) {
      console.error('updateAndPublishGroup():', e);
      return {
        data: {
          updateAndPublishGroup: {
            data: {},
            error: {
              code: '',
              message: e.message,
            },
          },
        },
      };
    }
  }

  async createAndPublishGroup(groupDto: PostGroupPayload) {
    console.info('createAndPublishGroup(): Creating groupDto', groupDto.name);

    try {
      const { groupAdmins, ...group } = groupDto;
      group.pin = await this.createUniquePin();
      const variables = this.getGroupInputParams(group);

      const createGroupResponse = await this.apolloClient.mutate({
        mutation: this.CREATE_GROUP,
        variables: variables.variables,
      });

      const createdGroup = <Group>createGroupResponse.data.createGroup.data;
      if (groupAdmins?.length) {
        await this.linkUsersToGroup(groupAdmins, createdGroup.uuid);
      }

      this.postGroupToGameApi(createdGroup);

      const publishGroupResponse = await this.apolloClient.mutate({
        mutation: this.PUBLISH_GROUP,
        variables: {
          revision: createGroupResponse.data.createGroup.data.id,
        },
      });

      return {
        data: {
          createAndPublishGroup: {
            data: {
              ...publishGroupResponse.data.publishGroup.data,
              groupAdmins,
            },
            error: null,
            __typename: 'GroupResponse',
          },
        },
      };
    } catch (e) {
      console.error('createAndPublishGroup():', e);
      return {
        error: {
          code: '',
          message: e,
        },
      };
    }
  }

  async listGroups(parentId: string) {
    console.info('listGroups(): fetching groups for parent', parentId);

    const query = this.apolloClient.query({
      query: this.LIST_GROUPS_WHERE,
      variables: { where: { organizationUuid: parentId } },
    });

    try {
      const [groupResponse, users] = await Promise.all([
        query,
        this.userService.readUsersByOrganization(parentId),
      ]);

      const groupsWithAdmins = this.combineUsersWithGroups(
        groupResponse.data.listGroups.data,
        users
      );

      return {
        data: {
          listGroups: {
            data: groupsWithAdmins,
            error: null,
            __typename: 'GroupListResponse',
          },
        },
      };
    } catch (e: any) {
      console.error('listGroups():', JSON.stringify(e));
      return {
        error: {
          code: '',
          message: e,
        },
      };
    }
  }

  private combineUsersWithGroups(groups: Group[], users: User[]) {
    return groups.map((group) => ({
      ...group,
      groupAdmins: users.filter(
        R.propSatisfies(isInList(group.uuid), 'group_ids')
      ),
    }));
  }

  /**
   * Resolve and handle users that are added to and/or removed from the list of admins of the given group.
   * @param groupDto
   * @returns
   */
  private async handleGroupAdmins(groupDto: PostGroupPayload) {
    const { groupAdmins = [], uuid } = groupDto;
    const promises = [] as Promise<any>[];
    const added = groupAdmins.filter(
      R.propSatisfies(R.complement(isInList(uuid)), 'group_ids')
    );
    const removed = groupAdmins.filter(R.propEq<string>('removed', true));

    if (added.length) {
      promises.push(this.linkUsersToGroup(added, uuid));
    }

    if (removed.length) {
      promises.push(this.unlinkUsersFromGroup(removed, uuid));
    }

    return Promise.all(promises);
  }

  /**
   * Link user to a group. Updates user's groups attribute in cognito with a list of group uuids.
   * @private
   * @param groupAdmins
   * @param groupId
   * @returns
   */
  private linkUsersToGroup(groupAdmins: User[], groupId: string) {
    console.debug(
      'linkUsersToGroup(): adding users',
      groupAdmins.map(R.prop('name')).join(', '),
      'to group',
      groupId
    );

    return Promise.all(
      groupAdmins.map((user) =>
        this.userService.updateUser({
          username: user.email,
          organizationIds: user.organization_id,
          groupIds: addToStringSet(groupId, user.group_ids),
        })
      )
    );
  }

  /**
   * Unlink user and a group. Updates user's groups attribute in cognito with a list of group uuids without the given group's uuid.
   * @private
   * @param groupAdmins
   * @param groupId
   * @returns
   */
  private unlinkUsersFromGroup(groupAdmins: User[], groupId: string) {
    console.debug(
      'unlinkUsersFromGroup(): removing users',
      groupAdmins.map(R.prop('name')).join(', '),
      'from group',
      groupId
    );

    return Promise.all(
      groupAdmins.map((user) =>
        this.userService.removeUserFromGroup(
          user.email,
          groupId,
          user.group_ids || []
        )
      )
    );
  }

  postGroupToGameApi(group: Group) {
    return this.questionGameService.postGroup(group);
  }

  putGroupToGameApi(group: Group) {
    return this.questionGameService.putGroup(group);
  }

  async createUniquePin(): Promise<string> {
    let counter = 0;
    while (counter < 50) {
      const pin = (Math.floor(Math.random() * 90000) + 10000).toString();

      try {
        const groupsResponse = await this.apolloClient.query({
          query: this.LIST_GROUPS_WHERE,
          variables: {
            where: {
              pin: pin,
            },
          },
        });

        if (
          groupsResponse &&
          groupsResponse.data?.listGroups?.data?.length == 0
        ) {
          return pin;
        } else {
          counter++;
        }
      } catch (e) {
        console.error('Error fetching existing pin-codes', e);
        break;
      }
    }

    throw new Error('Unique pin was not found!');
  }

  private getGroupInputParams(group: Group) {
    const { id, ...content } = group;
    return createMutateOptions(id, content);
  }

  async deleteGroup(revision: string) {
    console.info('deleteGroup(): Deleting group', revision);

    const deleteTimestamp = createTimestampWithTimezone();
    try {
      const variables = {
        revision: revision,
        data: { deletedAt: deleteTimestamp, validUntil: deleteTimestamp },
      };

      const updateGroupResponse = await this.apolloClient.mutate({
        mutation: this.CREATE_GROUP_FROM,
        variables: variables,
      });

      const createdGroup = <Group>updateGroupResponse.data.createGroupFrom.data;
      console.debug('did soft delete for group', JSON.stringify(createdGroup));
      const users = await this.userService.readUsersByGroup(createdGroup.uuid);
      console.debug(`found ${users.length} users linked to group`);
      if (users.length) {
        this.unlinkUsersFromGroup(users, createdGroup.uuid);
      }

      await this.putGroupToGameApi(createdGroup);

      await this.apolloClient.mutate({
        mutation: this.PUBLISH_GROUP,
        variables: {
          revision: updateGroupResponse.data.createGroupFrom.data.id,
        },
      });

      return {
        data: {
          deleteGroup: {
            data: true,
            error: null,
            __typename: 'CmsDeleteResponse',
          },
        },
      };
    } catch (e: any) {
      console.error('deleteGroup():', e);
      return {
        data: {
          deleteGroup: {
            data: false,
            error: {
              code: '',
              message: e.message,
            },
          },
        },
      };
    }
  }
}
