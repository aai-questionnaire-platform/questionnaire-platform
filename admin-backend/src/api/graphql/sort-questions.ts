import { GameInstance } from '../../datamodels/game-instance';
import { AdminUserService } from '../../services/admin-user-service';
import { QuestionService } from '../../services/question-service';

export async function sortQuestions(
  _path: string,
  body: any,
  _gameInstance: GameInstance,
  userService: AdminUserService
) {
  const { data } = body.variables;
  return new QuestionService(userService).sortQuestions(data);
}
