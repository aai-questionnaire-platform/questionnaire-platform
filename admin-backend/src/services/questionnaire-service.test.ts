import { createApolloClient } from '../api/graphql/apollo-client';
import { QuestionnaireService } from './questionnaire-service';
import { AdminUserService } from './admin-user-service';

jest.mock('../api/graphql/apollo-client.ts');
jest.mock('./options-service.ts');
jest.mock('./soft-delete-service.ts');
jest.mock('./admin-user-service');

describe('QuestionnaireService', () => {
  const mApolloClient = {
    query: jest.fn(),
    mutate: jest.fn(),
  };

  const createApolloClientMock = createApolloClient as jest.MockedFunction<
    typeof createApolloClient
  >;

  createApolloClientMock.mockImplementation(
    jest.fn().mockReturnValue(mApolloClient)
  );
  jest
    .spyOn(AdminUserService.prototype as any, 'getUserGameIds')
    .mockReturnValue(['game-1']);

  jest
    .spyOn(AdminUserService.prototype as any, 'userHasGame')
    .mockReturnValue(true);

  jest
    .spyOn(AdminUserService.prototype as any, 'getActiveGameId')
    .mockReturnValue('game-1');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create draft', () => {
    it('should create draft version', async () => {
      const service = new QuestionnaireService(
        new AdminUserService('', '', '', '', '')
      );
      const uuid = 'questionnaire-uuid-1';

      const variables = {
        uuid: uuid,
        title: 'joku title',
        author: 'mie',
        locale: 'fi-FI',
        gameUuid: 'game-1',
        editedBy: 'mie',
        deletedAt: null,
      };
      mApolloClient.query.mockResolvedValueOnce({
        data: {
          listQuestionnaires: {
            data: [
              {
                id: '1#0001',
                entryId: '2',
                meta: {
                  status: 'published',
                },
                ...variables,
              },
            ],
          },
        },
      });

      await service.createDraft(uuid);

      expect(mApolloClient.query).toHaveBeenCalledTimes(1);
      expect(mApolloClient.mutate).toHaveBeenCalledTimes(1);

      expect(mApolloClient.mutate).toHaveBeenNthCalledWith(1, {
        mutation: expect.any(Object),
        variables: {
          revision: '1#0001',
          data: variables,
        },
      });
    });

    it('delete-mutation is called with given revision', async () => {
      const service = new QuestionnaireService(
        new AdminUserService('', '', '', '', '')
      );

      mApolloClient.mutate.mockResolvedValueOnce({
        data: {
          deleteQuestionnaire: {
            data: true,
            error: null,
          },
        },
      });

      await service.deleteMutation('1#0001');

      expect(mApolloClient.mutate).toHaveBeenCalledTimes(1);

      expect(mApolloClient.mutate).toHaveBeenNthCalledWith(1, {
        mutation: expect.any(Object),
        variables: {
          revision: '1#0001',
        },
      });
    });
  });
});
