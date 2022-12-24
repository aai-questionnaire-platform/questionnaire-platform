import { GameInstance } from '../../datamodels/game-instance';
import { GroupsService } from '../../services/groups-service';

export async function deleteGroupAndUpdateUsers(
  _path: string,
  body: any,
  gameInstance: GameInstance
) {
  const service = new GroupsService(gameInstance);
  const response = await service.deleteGroup(body.variables.revision);
  return response;
}
