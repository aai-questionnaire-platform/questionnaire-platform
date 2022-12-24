import { GameInstance } from '../../datamodels/game-instance';
import { AdminUserService } from '../../services/admin-user-service';
import { QuestionService } from '../../services/question-service';

export async function createQuestion(
  _path: string,
  body: any,
  _gameInstance: GameInstance,
  userService: AdminUserService
) {
  return new QuestionService(userService).createQuestion(body.variables.data);
}

export async function updateQuestion(
  _path: string,
  body: any,
  _gameInstance: GameInstance,
  userService: AdminUserService
) {
  const { revision, data } = body.variables;
  return new QuestionService(userService).updateQuestion(
    revision,
    data,
    false,
    false
  );
}

export async function deleteQuestionWithOptions(
  _path: string,
  body: any,
  _gameInstance: GameInstance,
  userService: AdminUserService
) {
  const { revision } = body.variables;
  return new QuestionService(userService).removeQuestion(revision);
}
