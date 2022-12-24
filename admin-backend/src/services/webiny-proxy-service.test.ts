import axios from 'axios';
import { WebinyProxyService } from './webiny-proxy-service';
import { gql } from '@apollo/client/core';
import { print } from 'graphql/language/printer';

import { v4 as uuidv4 } from 'uuid';
import * as utils from './utils';
import { axiosPostMock } from './webiny-proxy-service.mocks';
import { SoftDeleteService } from './soft-delete-service';
import { AdminUserService } from './admin-user-service';

jest.mock('axios');
jest.mock('uuid/v4');
jest.mock('./soft-delete-service');
jest.mock('./admin-user-service');
jest.mock('./game-instance-service');

describe('WebinyProxyService', () => {
  const axiosMock: any = axiosPostMock;
  jest.spyOn(axios, 'create').mockReturnValue(axiosMock);

  jest
    .spyOn(AdminUserService.prototype as any, 'getUserGameIds')
    .mockReturnValue(['game-1']);

  jest
    .spyOn(AdminUserService.prototype as any, 'userHasGame')
    .mockReturnValue(true);

  jest
    .spyOn(AdminUserService.prototype as any, 'getActiveGameId')
    .mockReturnValue('game-1');

  (<any>uuidv4).mockImplementation(() => 'generated-uuid');

  const UPDATE_QUERY_WITH_UUID = JSON.stringify({
    operationName: 'UpdateSomething',
    query: `
    mutation UpdateSomething {
      updateSomething {
        data {
          uuid
        }
      }
    }
  `,
    variables: {
      data: {
        uuid: 'existing-uuid-on-update-mutation',
        gameUuid: 'game-1',
      },
    },
  });

  const CREATE_QUERY_WITH_GENERATED_UUID = JSON.stringify({
    operationName: 'CreateSomething',
    query: `
    mutation CreateSomething {
      createSomething {
        data {
          uuid
        }
      }
    }
  `,
    variables: {
      data: {
        uuid: 'generated-uuid',
        gameUuid: 'game-1',
      },
    },
  });

  const CREATEFROM_QUERY_WITH_EXISTING_UUID = JSON.stringify({
    operationName: 'CreateSomethingFrom',
    query: `
    mutation CreateSomethingFrom {
      createSomethingFrom {
        data {
          uuid
        }
      }
    }
  `,
    variables: {
      data: {
        uuid: 'existing-uuid-on-create-mutation',
        gameUuid: 'game-1',
      },
    },
  });

  const CREATE_QUERY_WITHOUT_UUID = JSON.stringify({
    operationName: 'CreateSomething',
    query: `
    mutation CreateSomething {
      createSomething {
        data {
          uuid
        }
      }
    }
  `,
    variables: {
      data: {},
    },
  });

  const CUSTOM_MUTATION_WITHOUT_UUID = JSON.stringify({
    operationName: 'CreateAndPublishGroup',
    query: `
    mutation CreateAndPublishGroup {
      createAndPublishGroup {
        data {
          uuid
        }
      }
    }
  `,
    variables: {
      data: {},
    },
  });

  const CUSTOM_MUTATION_WITH_GENERATED_UUID = JSON.stringify({
    operationName: 'CreateAndPublishGroup',
    query: `
    mutation CreateAndPublishGroup {
      createAndPublishGroup {
        data {
          uuid
        }
      }
    }
  `,
    variables: {
      data: {
        uuid: 'generated-uuid',
        gameUuid: 'game-1',
      },
    },
  });

  const CUSTOM_QUERY = JSON.stringify({
    operationName: 'ListGroups',
    variables: {
      data: {
        id: 'id',
      },
    },
  });

  const GET_QUERY_FOR_DELETED_MODEL = JSON.stringify({
    operationName: 'GetModel',
    query: `
    fragment ModelParts on Group {
      id
      entryId
      uuid
      name
      organizationUuid
      pin
      validFrom
      validUntil
    }
    query GetSomething($entryId: String) {
      getSomething(where: { entryId: $entryId }) {
        data {
          ...ModelParts
        }
      }
    }
    `,
    variables: {
      data: {
        revision: 'id',
      },
    },
  });

  const LIST_QUERY_ONE_NOT_DELETED = JSON.stringify({
    operationName: 'ListCategories',
    query: `query ListCategories {
      listCategories {
        data {
          id
          entryId
          uuid
          questionnaireUuid
          description
          entryMessages
          exitMessages
          __typename
        }
        __typename
      }
    }
    `,
  });

  const DELETE_MUTATION = JSON.stringify({
    operationName: 'DeleteSomething',
    variables: {
      revision: '61dfe9451ff45100093649f5',
      gameUuid: 'game-1',
    },
    query: `mutation DeleteSomething($revision: ID!) {
      deleteSomething(revision: $revision) {
        data
        error {
          code
          message
          __typename'
        }
        __typename
      }
    }`,
  });

  function withEditedBy(mutation: string, user: string) {
    const mutationObj = JSON.parse(mutation);
    if (mutationObj.variables && mutationObj.variables.data) {
      mutationObj.variables.data['editedBy'] = user;
    }
    return JSON.stringify(mutationObj);
  }

  const env = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...env, GAME_INSTANCES: '[]' };
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = env;
  });

  describe('handle graphql-queries', () => {
    it('read should be redirected correctly', async () => {
      const service = new WebinyProxyService(
        'mockToken',
        'mockEndpoint',
        'userid',
        'username'
      );
      const result = await service.handleRead(
        JSON.stringify({ param: 'value' })
      );
      expect(axiosMock.post).toBeCalledWith(
        'read/fi-FI',
        JSON.stringify({ param: 'value' })
      );
      expect(result).toBe('ok');
    });

    it('custom read query should be called if query name matches', async () => {
      const service = new WebinyProxyService(
        'mockToken',
        'mockEndpoint',
        'userid',
        'username'
      );
      const handleCustomQueryMock = jest
        .spyOn(WebinyProxyService.prototype as any, 'handleCustomQuery')
        .mockReturnValue('ok');
      const result = await service.handleRead(CUSTOM_QUERY);
      expect(handleCustomQueryMock).toBeCalledWith('read/fi-FI', CUSTOM_QUERY);
      expect(result).toBe('ok');
    });

    it('preview should be redirected correctly', async () => {
      const service = new WebinyProxyService(
        'mockToken',
        'mockEndpoint',
        'userid',
        'username'
      );
      const result = await service.handlePreview(
        JSON.stringify({ param: 'value' })
      );
      expect(axiosMock.post).toBeCalledWith(
        'preview/fi-FI',
        JSON.stringify({
          param: 'value',
        })
      );
      expect(result).toBe('ok');
    });

    it('custom preview query should be called if query name matches', async () => {
      const service = new WebinyProxyService(
        'mockToken',
        'mockEndpoint',
        'userid',
        'username'
      );
      const handleCustomQueryMock = jest
        .spyOn(WebinyProxyService.prototype as any, 'handleCustomQuery')
        .mockReturnValue('ok');
      const result = await service.handlePreview(CUSTOM_QUERY);
      expect(handleCustomQueryMock).toBeCalledWith(
        'preview/fi-FI',
        CUSTOM_QUERY
      );
      expect(result).toBe('ok');
    });

    it('results where delete_at is set should not be returned on list-query', async () => {
      const service = new WebinyProxyService(
        'mockToken',
        'mockEndpoint',
        'userid',
        'username'
      );
      const result = await service.handlePreview(LIST_QUERY_ONE_NOT_DELETED);
      expect(result.data.listGroups.data).toEqual([
        {
          __typename: 'Group',
          deletedAt: null,
          entryId: '61ea7f81467d9700099c5b52',
          id: '61ea7f81467d9700099c5b52#0002',
          name: 'Ryhmä222',
          organizationUuid: '61e13e08728afc0009f14073',
          pin: '63245',
          uuid: '66b9a11e-1bb3-4b62-bb57-4f406fff451a',
          validFrom: '2022-01-26T14:11:35+00:00',
          validUntil: '2022-01-26T14:11:35+00:00',
          gameUuid: 'game-1',
        },
      ]);
    });

    it('results where delete_at is set should not be returned on get-query', async () => {
      const service = new WebinyProxyService(
        'mockToken',
        'mockEndpoint',
        'userid',
        'username'
      );
      const result = await service.handlePreview(GET_QUERY_FOR_DELETED_MODEL);

      expect(result.data.getQuestionnaireDeleted).toStrictEqual({
        __typename: 'QuestionnaireResponse',
        data: null,
      });
      expect(result.data.getQuestionnaireNotDeleted).toStrictEqual({
        __typename: 'QuestionnaireResponse',
        data: {
          __typename: 'Questionnaire',
          author: 'Author',
          createdOn: '2022-01-20T15:03:22.476Z',
          deletedAt: null,
          entryId: '61e979bacf70930009fffe6c',
          id: '61e979bacf70930009fffe6c#0001',
          locale: 'fi-FI',
          title: 'Questionnaire 2022',
          uuid: '9ecc3b87-1b16-426c-a31f-e554b3cc4c99',
          gameUuid: 'game-1',
        },
      });
    });

    it('results where gameUuid is not allowed for user should not be returned on get-query', async () => {
      const service = new WebinyProxyService(
        'mockToken',
        'mockEndpoint',
        'userid',
        'username'
      );

      jest
        .spyOn(AdminUserService.prototype as any, 'getUserGameIds')
        .mockReturnValueOnce(['wrong-gameuuid']);

      const result = await service.handlePreview(LIST_QUERY_ONE_NOT_DELETED);
      expect(result.data.listGroups.data).toEqual([]);
    });

    it('gameUuid and deletedAt should be added to all queries', async () => {
      const service = new WebinyProxyService(
        'mockToken',
        'mockEndpoint',
        'userid',
        'username'
      );

      jest
        .spyOn(AdminUserService.prototype as any, 'getUserGameIds')
        .mockReturnValueOnce(['wrong-gameuuid']);

      const queryWithoutAddedAttributes = JSON.stringify({
        operationName: 'ListSomething',
        query: `query ListSomething {
            listSomething {
              data {
                id
              }
              __typename
            }
            getSomethingElse {
              data {
                id
              }
              __typename
            }
          }
          `,
      });

      const queryWithAddedAttributes = JSON.stringify({
        operationName: 'ListSomething',
        query: print(gql`
          query ListSomething {
            listSomething {
              data {
                id
                deletedAt
                gameUuid
              }
              __typename
            }
            getSomethingElse {
              data {
                id
                deletedAt
                gameUuid
              }
              __typename
            }
          }
        `),
      });

      await service.handlePreview(queryWithoutAddedAttributes);
      expect(axiosMock.post).toBeCalledWith(
        'preview/fi-FI',
        queryWithAddedAttributes
      );
    });
  });

  describe('handle graphql-mutations', () => {
    it('On update, query should be redirected as it is', async () => {
      const service = new WebinyProxyService(
        'mockToken',
        'mockEndpoint',
        'userid',
        'username'
      );
      const result = await service.handleManage(UPDATE_QUERY_WITH_UUID);
      expect(axiosMock.post).toBeCalledWith(
        'manage/fi-FI',
        withEditedBy(UPDATE_QUERY_WITH_UUID, 'userid')
      );
      expect(result).toBe('ok');
    });

    it('Update mutation without correct gameUuid should be rejected', async () => {
      const service = new WebinyProxyService(
        'mockToken',
        'mockEndpoint',
        'userid',
        'username'
      );

      jest
        .spyOn(AdminUserService.prototype as any, 'userHasGame')
        .mockReturnValueOnce(false);

      await expect(
        service.handleManage(UPDATE_QUERY_WITH_UUID)
      ).rejects.toEqual(new Error('User not authorized for gameUuid game-1'));
    });

    it('on create uuid should be created', async () => {
      const service = new WebinyProxyService(
        'mockToken',
        'mockEndpoint',
        'userid',
        'username'
      );
      const result = await service.handleManage(CREATE_QUERY_WITHOUT_UUID);
      expect(axiosMock.post).toBeCalledWith(
        'manage/fi-FI',
        withEditedBy(CREATE_QUERY_WITH_GENERATED_UUID, 'userid')
      );
      expect(result).toBe('ok');
    });

    it('if uuid exists it will not be re-generated', async () => {
      const service = new WebinyProxyService(
        'mockToken',
        'mockEndpoint',
        'userid',
        'username'
      );

      const result = await service.handleManage(
        CREATEFROM_QUERY_WITH_EXISTING_UUID
      );
      expect(axiosMock.post).toBeCalledWith(
        'manage/fi-FI',
        withEditedBy(CREATEFROM_QUERY_WITH_EXISTING_UUID, 'userid')
      );
      expect(result).toBe('ok');
    });

    it('custom mutation should be called if mutation name matches and uuid is generated if it is missing', async () => {
      const service = new WebinyProxyService(
        'mockToken',
        'mockEndpoint',
        'userid',
        'username'
      );
      const handleCustomMutationMock = jest
        .spyOn(WebinyProxyService.prototype as any, 'handleCustomMutation')
        .mockReturnValue('ok');
      const result = await service.handleManage(CUSTOM_MUTATION_WITHOUT_UUID);
      expect(handleCustomMutationMock).toBeCalledWith(
        JSON.parse(withEditedBy(CUSTOM_MUTATION_WITH_GENERATED_UUID, 'userid'))
      );
      expect(result).toBe('ok');
    });

    it('when delete-mutation is called, call to soft-delete-service should be made', async () => {
      const softDeleteMock = jest.fn();
      (SoftDeleteService as unknown as jest.Mock).mockImplementationOnce(
        () => ({
          deleteModel: softDeleteMock.mockResolvedValueOnce(true),
        })
      );

      const service = new WebinyProxyService(
        'mockToken',
        'mockEndpoint',
        'userid',
        'username'
      );
      jest
        .spyOn(utils, 'createTimestampWithTimezone')
        .mockReturnValue('generated date with timezone');

      await service.handleManage(DELETE_MUTATION);

      expect(softDeleteMock).toHaveBeenCalledWith(
        '61dfe9451ff45100093649f5',
        'Something'
      );
    });
  });
});
