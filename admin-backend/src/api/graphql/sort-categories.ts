import { GameInstance } from '../../datamodels/game-instance';
import { AdminUserService } from '../../services/admin-user-service';
import { CategoryService } from '../../services/category-service';

export async function sortCategories(
  _path: string,
  body: any,
  _gameInstance: GameInstance,
  userService: AdminUserService
) {
  const { data } = body.variables;
  return new CategoryService(userService).sortCategories(data);
}
