import { GameInstance } from '../../datamodels/game-instance';
import { GroupsService } from '../../services/groups-service';

export async function updateAndPublishGroup(
  _path: string,
  body: any,
  gameInstance: GameInstance
) {
  const service = new GroupsService(gameInstance);
  const response = await service.updateAndPublishGroup(
    body.variables.revision,
    body.variables.data
  );
  return response;
}

export async function createAndPublishGroup(
  _path: string,
  body: any,
  gameInstance: GameInstance
) {
  const service = new GroupsService(gameInstance);
  const response = await service.createAndPublishGroup(body.variables.data);
  return response;
}
