import * as R from 'ramda';
import { createApolloClient } from '../api/graphql/apollo-client';
import { GameInstance } from '../datamodels/game-instance';
import { GroupsService } from './groups-service';
import { QuestionGameService } from './question-game-service';
import { UserService } from './user-service';
import * as utils from './utils';

jest.mock('../api/graphql/apollo-client.ts');
jest.mock('./question-game-service');
jest.mock('./user-service');

describe('GroupsService', () => {
  const mApolloClient = {
    query: jest.fn().mockReturnValue({
      data: {
        listGroups: {
          data: [],
        },
      },
    }),
    mutate: jest.fn((params) => {
      const datasetName =
        params.mutation.definitions[1].selectionSet.selections[0].name.value;
      const returnDataset: any = {};
      returnDataset[datasetName] = params.variables.data
        ? {
            data: {
              id: '1',
              entryId: '',
              uuid: 'random-uuid-1',
              name: params.variables.data.name,
              validFrom: '',
              validUntil: '',
              organizationUuid: params.variables.data.organizationUuid,
              pin: params.variables.data.pin,
            },
          }
        : {
            data: {
              id: '1',
              entryId: '',
              uuid: 'random-uuid-1',
              name: 'published',
              validFrom: '',
              validUntil: '',
              organizationUuid: '100',
              pin: '11111',
            },
          };
      return {
        data: returnDataset,
      };
    }),
  };

  const createApolloClientMock = createApolloClient as jest.MockedFunction<
    typeof createApolloClient
  >;

  createApolloClientMock.mockImplementation(
    jest.fn().mockReturnValue(mApolloClient)
  );

  const gameInstance: GameInstance = {
    gameUuid: 'game-1',
    gameApiToken: 'token',
    gameApiEndpoint: 'endpoint',
    gameAdminUserPoolId: 'userpoolid',
  };

  beforeEach(() => {
    mApolloClient.query.mockClear();
    mApolloClient.mutate.mockClear();
  });

  describe('listGroups', () => {
    it('should return a list of groups', async () => {
      const service = new GroupsService(gameInstance);

      jest
        .spyOn(UserService.prototype as any, 'readUsersByOrganization')
        .mockResolvedValueOnce([]);

      mApolloClient.query.mockResolvedValueOnce({
        data: { listGroups: { data: [{ uuid: '1' }] } },
      });

      const response = await service.listGroups('1');
      expect(response.data?.listGroups.data).toEqual([
        { uuid: '1', groupAdmins: [] },
      ]);
    });

    it('should return a list of groups with groupAdmins', async () => {
      const service = new GroupsService(gameInstance);
      const user = { id: '1', group_ids: ['1'] };

      jest
        .spyOn(UserService.prototype as any, 'readUsersByOrganization')
        .mockResolvedValueOnce([user]);

      mApolloClient.query.mockResolvedValueOnce({
        data: { listGroups: { data: [{ uuid: '1' }] } },
      });

      const response = await service.listGroups('1');
      expect(response.data?.listGroups.data).toEqual([
        { uuid: '1', groupAdmins: [user] },
      ]);
    });

    it('should return an error if fetching users fails', async () => {
      const service = new GroupsService(gameInstance);
      const error = new Error('FAILED');

      jest
        .spyOn(UserService.prototype as any, 'readUsersByOrganization')
        .mockRejectedValueOnce(error);

      const response = await service.listGroups('1');
      expect(response).toEqual({
        error: {
          code: '',
          message: error,
        },
      });
    });

    it('should return an error if list groups query fails', async () => {
      const service = new GroupsService(gameInstance);
      const error = new Error('FAILED');

      mApolloClient.query.mockRejectedValueOnce(error);

      const response = await service.listGroups('1');
      expect(response).toEqual({
        error: {
          code: '',
          message: error,
        },
      });
    });
  });

  describe('createUniquePin', () => {
    it('pin should be 5 digits long', async () => {
      const service = new GroupsService(gameInstance);
      const pin = await service.createUniquePin();
      expect(pin.length).toBe(5);
      expect(mApolloClient.query).toBeCalledWith({
        query: service.LIST_GROUPS_WHERE,
        variables: { where: { pin: pin } },
      });
      expect(mApolloClient.query).toBeCalledTimes(1);
    });

    it('pin should be re-created if it is in use', async () => {
      const resultWithData: any = {
        data: {
          listGroups: {
            data: [{ id: '123123', uuid: 'random-uuid-123123' }],
          },
        },
      };
      mApolloClient.query.mockReturnValueOnce(resultWithData);

      const service = new GroupsService(gameInstance);
      const pin = await service.createUniquePin();
      expect(pin.length).toBe(5);
      expect(mApolloClient.query).toBeCalledWith({
        query: service.LIST_GROUPS_WHERE,
        variables: { where: { pin: pin } },
      });
      expect(mApolloClient.query).toBeCalledTimes(2);
    });
  });

  describe('createAndPublishGroup', () => {
    it('Group should be created, published and posted to game api', async () => {
      const service = new GroupsService(gameInstance);
      const group: any = {
        name: 'Testi',
        organizationUuid: '1',
        groupAdmins: [],
      };
      const response: any = await service.createAndPublishGroup(group);

      expect(response.data.createAndPublishGroup.data).toBeDefined;
      expect(response.data.createAndPublishGroup.error).toBeNull;

      expect(mApolloClient.mutate).toBeCalledTimes(2);
    });

    it('should add groupAdmins to the group', async () => {
      const updateUserMock = jest.fn();
      (UserService as unknown as jest.Mock).mockImplementationOnce(() => ({
        updateUser: updateUserMock.mockResolvedValueOnce(true),
      }));
      const service = new GroupsService(gameInstance);
      const group: any = {
        name: 'Testi',
        organizationUuid: '1',
        groupAdmins: [
          {
            name: 'Testi Testaaja',
            email: 'a@a.com',
            organization_id: '456',
            group_ids: '',
          },
        ],
      };

      const response = {
        data: {
          createGroup: {
            data: {
              ...group,
              uuid: 'random-uuid-123',
            },
          },
        },
      };

      mApolloClient.mutate.mockResolvedValueOnce(response as never);

      await service.createAndPublishGroup(group);

      expect(updateUserMock).toHaveBeenCalledWith({
        username: 'a@a.com',
        organizationIds: '456',
        groupIds: 'random-uuid-123',
      });
    });
  });

  describe('updateAndPublishGroup', () => {
    it('Group should be updated, published and posted to game api', async () => {
      const service = new GroupsService(gameInstance);
      const group: any = {
        name: 'Testi',
        organizationUuid: '1',
      };

      const response: any = await service.updateAndPublishGroup(
        '123456',
        group
      );

      expect(response.data.updateAndPublishGroup.data).toBeDefined;
      expect(response.data.updateAndPublishGroup.error).toBeNull;

      expect(mApolloClient.mutate).toBeCalledTimes(2);
    });

    it('should create a new revision', async () => {
      const service = new GroupsService(gameInstance);
      const group: any = { id: 1, uuid: 'random-uuid-1' };

      await service.updateAndPublishGroup('1', group);

      expect(mApolloClient.mutate).toHaveBeenCalledWith({
        mutation: service.CREATE_GROUP_FROM,
        variables: expect.any(Object),
      });
    });

    it('should put group to game backend', async () => {
      const putGroupMock = jest.fn();

      (QuestionGameService as unknown as jest.Mock).mockImplementationOnce(
        () => ({
          putGroup: putGroupMock,
        })
      );

      const service = new GroupsService(gameInstance);
      const group: any = { id: 1, uuid: 'random-uuid-1' };

      await service.updateAndPublishGroup('1', group);

      expect(putGroupMock).toHaveBeenCalledTimes(1);
    });

    it('should publish the new revision', async () => {
      const service = new GroupsService(gameInstance);
      const group: any = { id: 1, uuid: 'random-uuid-1' };

      await service.updateAndPublishGroup('1', group);

      expect(mApolloClient.mutate).toHaveBeenCalledWith({
        mutation: service.PUBLISH_GROUP,
        variables: {
          revision: '1',
        },
      });
    });

    it('should return correct data', async () => {
      const service = new GroupsService(gameInstance);
      const group: any = { id: 1, uuid: 'random-uuid-1' };

      const response = await service.updateAndPublishGroup('1', group);

      expect(response).toEqual({
        data: {
          updateAndPublishGroup: {
            data: expect.any(Object),
            error: null,
            __typename: 'GroupResponse',
          },
        },
      });
    });

    it('should add groupAdmins to the group', async () => {
      const updateUserMock = jest.fn();
      (UserService as unknown as jest.Mock).mockImplementationOnce(() => ({
        updateUser: updateUserMock.mockResolvedValueOnce(true),
      }));
      const service = new GroupsService(gameInstance);
      const group: any = {
        name: 'Testi',
        entryId: '3',
        uuid: 'random-uuid-3',
        organizationUuid: '1',
        groupAdmins: [
          {
            name: 'Testi Testaaja',
            email: 'a@a.com',
            organization_id: '456',
            group_ids: [],
          },
          {
            name: 'Testi Testaaja 2',
            email: 'b@a.com',
            organization_id: '456',
            group_ids: ['1', '2'],
          },
          {
            name: 'Testi Testaaja 3',
            email: 'c@a.com',
            organization_id: '456',
            group_ids: ['random-uuid-3'],
          },
        ],
      };

      const response = {
        data: {
          createGroupFrom: {
            data: {
              ...group,
              entryId: '123',
            },
          },
        },
      };

      mApolloClient.mutate.mockResolvedValueOnce(response as never);

      await service.updateAndPublishGroup('123#001', group);

      // should only be called twice b/c Testi Testaaja 3 already is member of the group
      expect(updateUserMock).toHaveBeenCalledTimes(2);
      expect(updateUserMock).toHaveBeenCalledWith({
        username: 'a@a.com',
        organizationIds: '456',
        groupIds: 'random-uuid-3',
      });
      expect(updateUserMock).toHaveBeenCalledWith({
        username: 'b@a.com',
        organizationIds: '456',
        groupIds: '1, 2, random-uuid-3',
      });
    });

    it('should unlink removed users from the group', async () => {
      const removeUserFromGroupMock = jest.fn();

      (UserService as unknown as jest.Mock).mockImplementationOnce(() => ({
        updateUser: jest.fn().mockResolvedValueOnce(true),
        removeUserFromGroup:
          removeUserFromGroupMock.mockResolvedValueOnce(true),
      }));

      const service = new GroupsService(gameInstance);
      const group: any = {
        name: 'Testi',
        uuid: 'random-uuid-3',
        groupAdmins: [
          {
            name: 'Testi Testaaja',
            email: 'a@a.com',
            organization_id: '456',
            group_ids: ['random-uuid-3'],
            removed: true,
          },
          {
            name: 'Testi Testaaja 2',
            email: 'b@a.com',
            organization_id: '456',
            group_ids: ['1', 'random-uuid-3'],
          },
        ],
      };

      const response = {
        data: { createGroupFrom: { data: R.omit(['groupAdmins'], group) } },
      };

      mApolloClient.mutate.mockResolvedValueOnce(response as never);

      await service.updateAndPublishGroup('123#001', group);

      expect(removeUserFromGroupMock).toHaveBeenCalledWith(
        'a@a.com',
        'random-uuid-3',
        ['random-uuid-3']
      );
    });

    it('should return an error if creating new revision fails', async () => {
      const service = new GroupsService(gameInstance);
      const group: any = { id: 1, uuid: 'random-uuid-1' };

      mApolloClient.mutate.mockRejectedValueOnce(new Error('ERROR') as never);

      const response = await service.updateAndPublishGroup('1', group);

      expect(response).toEqual({
        data: {
          updateAndPublishGroup: {
            data: {},
            error: {
              code: '',
              message: 'ERROR',
            },
          },
        },
      });
    });

    it('should return an error if putting new revision to the game backend fails', async () => {
      const putGroupMock = jest.fn().mockRejectedValueOnce(new Error('ERROR'));

      (QuestionGameService as unknown as jest.Mock).mockImplementationOnce(
        () => ({
          putGroup: putGroupMock,
        })
      );

      const service = new GroupsService(gameInstance);
      const group: any = { id: 1, uuid: 'random-uuid-1' };

      const response = await service.updateAndPublishGroup('1', group);

      expect(response).toEqual({
        data: {
          updateAndPublishGroup: {
            data: {},
            error: {
              code: '',
              message: 'ERROR',
            },
          },
        },
      });
    });

    it('should return an error if publishing a new revision fails', async () => {
      const service = new GroupsService(gameInstance);
      const group: any = { id: 1, uuid: 'random-uuid-1' };

      mApolloClient.mutate
        .mockResolvedValueOnce({
          data: { createGroupFrom: { data: {} } },
        } as never)
        .mockRejectedValueOnce(new Error('ERROR') as never);

      const response = await service.updateAndPublishGroup('1', group);

      expect(response).toEqual({
        data: {
          updateAndPublishGroup: {
            data: {},
            error: {
              code: '',
              message: 'ERROR',
            },
          },
        },
      });
    });
  });

  describe('deleteGroup', () => {
    it('Group should be updated with deletedAt, published and posted to game api, and groupUuid should be removed from users', async () => {
      const removeUserFromGroupMock = jest.fn();

      (UserService as unknown as jest.Mock).mockImplementationOnce(() => ({
        readUsersByGroup: jest.fn().mockResolvedValueOnce([
          {
            name: 'Testi Testaaja 2',
            email: 'b@a.com',
            organization_id: '456',
            group_ids: ['random-uuid-1', 'random-uuid-2'],
          },
        ]),
        removeUserFromGroup:
          removeUserFromGroupMock.mockResolvedValueOnce(true),
      }));

      jest
        .spyOn(utils, 'createTimestampWithTimezone')
        .mockReturnValue('generated date with timezone');

      const putGroupMock = jest.fn();
      (QuestionGameService as unknown as jest.Mock).mockImplementationOnce(
        () => ({
          putGroup: putGroupMock,
        })
      );

      const service = new GroupsService(gameInstance);

      const response: any = await service.deleteGroup('1');

      expect(response.data.deleteGroup.data).toBe(true);
      expect(response.data.deleteGroup.error).toBeNull;

      expect(mApolloClient.mutate.mock.calls).toEqual([
        [
          {
            mutation: service.CREATE_GROUP_FROM,
            variables: {
              revision: '1',
              data: {
                deletedAt: 'generated date with timezone',
                validUntil: 'generated date with timezone',
              },
            },
          },
        ],
        [
          {
            mutation: service.PUBLISH_GROUP,
            variables: {
              revision: '1',
            },
          },
        ],
      ]);

      expect(putGroupMock).toHaveBeenCalledTimes(1);

      expect(removeUserFromGroupMock).toHaveBeenCalledWith(
        'b@a.com',
        'random-uuid-1',
        ['random-uuid-1', 'random-uuid-2']
      );
    });

    it('should return an error if creating new revision fails', async () => {
      (UserService as unknown as jest.Mock).mockImplementationOnce(() => ({
        readUsersByGroup: jest.fn().mockResolvedValueOnce([]),
      }));
      const service = new GroupsService(gameInstance);

      mApolloClient.mutate.mockRejectedValueOnce(new Error('ERROR') as never);

      const response = await service.deleteGroup('1');

      expect(response).toEqual({
        data: {
          deleteGroup: {
            data: false,
            error: {
              code: '',
              message: 'ERROR',
            },
          },
        },
      });
    });

    it('should return an error if putting new revision to the game backend fails', async () => {
      (UserService as unknown as jest.Mock).mockImplementationOnce(() => ({
        readUsersByGroup: jest.fn().mockResolvedValueOnce([]),
      }));

      const putGroupMock = jest.fn().mockRejectedValueOnce(new Error('ERROR'));

      (QuestionGameService as unknown as jest.Mock).mockImplementationOnce(
        () => ({
          putGroup: putGroupMock,
        })
      );

      const service = new GroupsService(gameInstance);

      const response = await service.deleteGroup('1');

      expect(response).toEqual({
        data: {
          deleteGroup: {
            data: false,
            error: {
              code: '',
              message: 'ERROR',
            },
          },
        },
      });
    });

    it('should return an error if publishing a new revision fails', async () => {
      (UserService as unknown as jest.Mock).mockImplementationOnce(() => ({
        readUsersByGroup: jest.fn().mockResolvedValueOnce([]),
      }));

      const service = new GroupsService(gameInstance);

      mApolloClient.mutate
        .mockResolvedValueOnce({
          data: { createGroupFrom: { data: {} } },
        } as never)
        .mockRejectedValueOnce(new Error('ERROR') as never);

      const response = await service.deleteGroup('1');

      expect(response).toEqual({
        data: {
          deleteGroup: {
            data: false,
            error: {
              code: '',
              message: 'ERROR',
            },
          },
        },
      });
    });
  });
});
