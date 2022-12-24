import { RestConnector } from '../api/rest/rest-connector';
import { GameInstance } from '../datamodels/game-instance';
import { Group } from '../types';

export class QuestionGameService {
  private restConnector;

  private static GROUPS_ENDPOINT = 'admin/groups';
  private static QUESTIONNAIRE_ENDPOINT = 'admin/questionnaire';

  constructor(private gameInstance: GameInstance) {
    this.restConnector = new RestConnector(
      gameInstance.gameApiEndpoint,
      gameInstance.gameApiToken
    );
  }

  private createGroupRequestParams(group: Group): any {
    return {
      id: group.uuid,
      name: group.name,
      pin: group.pin,
      valid_until: group.deletedAt
        ? group.deletedAt
        : '2998-12-31T22:00:00.000Z',
      parent_organization_id: group.organizationUuid,
      deleted_at: group.deletedAt,
      edited_by: group.editedBy,
    };
  }

  postGroup(group: Group) {
    return this.restConnector.postJSON(
      QuestionGameService.GROUPS_ENDPOINT,
      this.createGroupRequestParams(group)
    );
  }

  putGroup(group: Group) {
    return this.restConnector.putJSON(
      QuestionGameService.GROUPS_ENDPOINT,
      this.createGroupRequestParams(group)
    );
  }

  async postQuestionnaire(questionnaire: any) {
    return await this.restConnector.postJSON(
      QuestionGameService.QUESTIONNAIRE_ENDPOINT,
      questionnaire
    );
  }
}
