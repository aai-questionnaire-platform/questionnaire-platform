import { GameInstance } from '../../datamodels/game-instance';
import { AdminUserService } from '../../services/admin-user-service';
import { PublishService } from '../../services/publish-service';

export async function publishQuestionnaire(
  _path: string,
  body: any,
  gameInstance: GameInstance,
  userService: AdminUserService
) {
  return new PublishService(userService, gameInstance).publishQuestionnaire(
    body.variables.data
  );
}
