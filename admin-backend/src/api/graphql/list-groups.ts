import { GameInstance } from '../../datamodels/game-instance';
import { GroupsService } from '../../services/groups-service';

export async function listGroups(
  _path: string,
  body: any,
  gameInstance: GameInstance
) {
  const service = new GroupsService(gameInstance);
  return service.listGroups(body.variables.parentId);
}
