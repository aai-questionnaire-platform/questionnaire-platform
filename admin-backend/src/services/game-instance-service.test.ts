import { GameInstance } from '../datamodels/game-instance';
import { AdminUserService } from './admin-user-service';
import { GameInstanceService } from './game-instance-service';

jest.mock('../api/graphql/apollo-client.ts');
jest.mock('./question-game-service');
jest.mock('./user-service');

describe('GameInstanceService', () => {
  const gameInstances: Array<GameInstance> = [
    {
      gameUuid: 'game-1',
      gameApiToken: 'token-1',
      gameApiEndpoint: 'endpoint-1',
      gameAdminUserPoolId: 'userpoolid-1',
    },
    {
      gameUuid: 'game-2',
      gameApiToken: 'token-2',
      gameApiEndpoint: 'endpoint-2',
      gameAdminUserPoolId: 'userpoolid-2',
    },
  ];

  jest
    .spyOn(AdminUserService.prototype as any, 'getUserGameIds')
    .mockReturnValue(['game-1']);

  describe('getGameInstance', () => {
    it('should return gameInstance by gameUuid', async () => {
      const service = new GameInstanceService(
        gameInstances,
        new AdminUserService('', '', '', '', '')
      );

      const result = service.getGameInstance('game-2');

      expect(result).toEqual(gameInstances[1]);
    });

    it('should return default gameInstance by null gameUuid', async () => {
      const service = new GameInstanceService(
        gameInstances,
        new AdminUserService('', '', '', '', '')
      );

      const result = service.getGameInstance(null);

      expect(result).toEqual(gameInstances[0]);
    });

    it('should throw error when gameInstance gameInstance not found', async () => {
      const service = new GameInstanceService(
        gameInstances,
        new AdminUserService('', '', '', '', '')
      );

      expect(() => {
        service.getGameInstance('game-not-exists');
      }).toThrow(new Error('gameInstance with uuid game-not-exists not found'));
    });

    it('should throw error when user has multiple gameIds and default game-instance is requested', async () => {
      jest
        .spyOn(AdminUserService.prototype as any, 'getUserGameIds')
        .mockReturnValueOnce(['game-1', 'game-2']);
      const service = new GameInstanceService(
        gameInstances,
        new AdminUserService('', '', '', '', '')
      );

      expect(() => {
        service.getDefaultGameInstance();
      }).toThrow(
        new Error(
          'User has multiple gameIds configured, gameUuid must be included in request parameter data.gameUuid'
        )
      );
    });
  });
});
