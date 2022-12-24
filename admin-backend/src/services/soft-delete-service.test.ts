import { createApolloClient } from '../api/graphql/apollo-client';
import { gql } from '@apollo/client/core';
import { SoftDeleteService } from './soft-delete-service';
import * as utils from './utils';

jest.mock('../api/graphql/apollo-client.ts');

describe('SoftDeleteService', () => {
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
        params.mutation.definitions[0].selectionSet.selections[0].name.value;
      const returnDataset: any = {};
      returnDataset[datasetName] = {
        data: {
          id: '1',
          uuid: 'random-uuid-1',
          gameUuid: 'game-1',
          deletedAt: null,
        },
      };
      return {
        data: returnDataset,
      };
    }),
  };

  const SOFT_DELETE_MUTATION_PARAMS = {
    mutation: gql`
      mutation CreateModelnameFrom($revision: ID!, $data: ModelnameInput!) {
        createModelnameFrom(revision: $revision, data: $data) {
          data {
            id
            uuid
            deletedAt
            gameUuid
          }
          error {
            code
            message
          }
        }
      }
    `,
    variables: {
      revision: '1',
      data: {
        deletedAt: 'generated date with timezone',
      },
    },
  };

  const createApolloClientMock = createApolloClient as jest.MockedFunction<
    typeof createApolloClient
  >;

  createApolloClientMock.mockImplementation(
    jest.fn().mockReturnValue(mApolloClient)
  );

  beforeEach(() => {
    mApolloClient.query.mockClear();
    mApolloClient.mutate.mockClear();
  });

  describe('deleteModel', () => {
    it('Model should be updated with deletedAt', async () => {
      jest
        .spyOn(utils, 'createTimestampWithTimezone')
        .mockReturnValue('generated date with timezone');

      const service = new SoftDeleteService();

      const response: any = await service.deleteModel('1', 'Modelname');

      expect(mApolloClient.mutate.mock.calls).toEqual([
        [SOFT_DELETE_MUTATION_PARAMS],
      ]);

      expect(response).toEqual({
        data: {
          deleteModelname: {
            data: { uuid: 'random-uuid-1' },
            error: null,
            __typename: 'CmsDeleteResponse',
          },
        },
      });
    });

    it('should return an error if creating new revision fails', async () => {
      const service = new SoftDeleteService();

      mApolloClient.mutate.mockRejectedValueOnce(new Error('ERROR') as never);

      const response: any = await service.deleteModel('1', 'Modelname');

      expect(response).toEqual({
        data: {
          deleteModelname: {
            data: null,
            error: {
              code: '',
              message: 'ERROR',
            },
            __typename: 'CmsDeleteResponse',
          },
        },
      });
    });
  });
});
