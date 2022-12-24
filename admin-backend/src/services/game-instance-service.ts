import { GameInstance } from '../datamodels/game-instance';
import { AdminUserService } from './admin-user-service';

export class GameInstanceService {
  constructor(
    protected gameInstances: Array<GameInstance>,
    protected adminUserService: AdminUserService
  ) {}

  getDefaultGameInstance(): GameInstance {
    return this.getGameInstance(null);
  }
  getGameInstance(gameUuid: string | null): GameInstance {
    if (!gameUuid) {
      const userGameIds = this.adminUserService.getUserGameIds();
      console.debug(
        'getGameInstance: gameUuid null, using default gameId from userpool'
      );
      if (userGameIds.length == 0) {
        throw Error('User does not have gameIds configured');
      } else if (userGameIds.length == 1) {
        console.debug('Found single gameId from userpool');
        gameUuid = userGameIds[0];
      } else {
        throw Error(
          'User has multiple gameIds configured, gameUuid must be included in request parameter data.gameUuid'
        );
      }
    }
    console.debug(
      `Finding gameInstance with uuid ${gameUuid} from ${this.gameInstances}`
    );
    const gameInstance = this.gameInstances.find(
      (gameInstance) => gameInstance.gameUuid === gameUuid
    );
    console.debug(`Found ${JSON.stringify(gameInstance)}`);
    if (!gameInstance) {
      throw Error('gameInstance with uuid ' + gameUuid + ' not found');
    }
    return gameInstance;
  }
}
