import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { deleteCategoryWithQuestions } from '../api/graphql/delete-category';
import { sortCategories } from '../api/graphql/sort-categories';
import { deleteGroupAndUpdateUsers } from '../api/graphql/delete-groups';
import { listGroups } from '../api/graphql/list-groups';
import { publishQuestionnaire } from '../api/graphql/publish-questionnaire';
import {
  createQuestion,
  deleteQuestionWithOptions,
  updateQuestion,
} from '../api/graphql/question-crud';
import {
  createAndPublishGroup,
  updateAndPublishGroup,
} from '../api/graphql/save-and-publish-group';
import { updateCategory } from '../api/graphql/update-category';
import { AdminUserService } from './admin-user-service';
import { addQueryAttributes, filterResults } from './graphql-utils';
import { SoftDeleteService } from './soft-delete-service';
import * as R from 'ramda';
import { sortQuestions } from '../api/graphql/sort-questions';
import { rollbackQuestionnaire } from '../api/graphql/rollback-questionnaire';
import { GameInstanceService } from './game-instance-service';
import { parseGameInstances } from './utils';

export class WebinyProxyService {
  private MANAGE_PATH = 'manage/fi-FI';
  private READ_PATH = 'read/fi-FI';
  private PREVIEW_PATH = 'preview/fi-FI';

  private userService: AdminUserService;
  private gameInstanceService: GameInstanceService;

  constructor(
    private webinyToken: string,
    private webinyEndpoint: string,
    private userSub: string,
    private userName: string
  ) {
    this.userService = new AdminUserService(
      <string>process.env['AWS_ACCESS_KEY_ID'],
      <string>process.env['AWS_SECRET_ACCESS_KEY'],
      <string>process.env['AWS_SESSION_TOKEN'],
      <string>process.env['ADMIN_USER_POOL'],
      'eu-west-1'
    );
    console.log(
      `WebinyProxyService has GAME_INSTANCES: ${process.env['GAME_INSTANCES']}`
    );

    this.gameInstanceService = new GameInstanceService(
      parseGameInstances(<string>process.env['GAME_INSTANCES']),
      this.userService
    );
  }

  private CUSTOM_MUTATIONS: Record<string, any> = {
    CreateAndPublishGroup: createAndPublishGroup,
    UpdateAndPublishGroup: updateAndPublishGroup,
    CreateQuestion: createQuestion,
    UpdateQuestion: updateQuestion,
    DeleteGroup: deleteGroupAndUpdateUsers,
    DeleteQuestion: deleteQuestionWithOptions,
    DeleteCategory: deleteCategoryWithQuestions,
    SortCategories: sortCategories,
    SortQuestions: sortQuestions,
    UpdateCategory: updateCategory,
    PublishQuestionnaire: publishQuestionnaire,
    RollbackQuestionnaire: rollbackQuestionnaire,
  };

  private CUSTOM_QUERIES: Record<string, any> = {
    ListGroups: listGroups,
  };

  async handleRead(body: string) {
    await this.userService.initUser(this.userName);
    const bodyObject = JSON.parse(body);

    if (this.isCustomQuery(bodyObject)) {
      return this.handleCustomQuery(this.READ_PATH, body);
    }

    return this.redirect(this.READ_PATH, this.checkOrAddAttributes(body));
  }

  async handlePreview(body: string) {
    await this.userService.initUser(this.userName);
    const bodyObject = JSON.parse(body);

    if (this.isCustomQuery(bodyObject)) {
      return this.handleCustomQuery(this.PREVIEW_PATH, body);
    }

    return this.redirect(this.PREVIEW_PATH, this.checkOrAddAttributes(body));
  }

  async handleManage(body: string) {
    await this.userService.initUser(this.userName);
    console.info('handling manage for', body);
    let bodyObject = JSON.parse(body);

    //Uuid and gameUuid is set for new models
    if (bodyObject?.operationName.includes('Create')) {
      bodyObject = this.addRequiredFields(bodyObject);
    }

    //All update mutations should include valid gameUuid
    if (
      !this.isQuery(bodyObject) &&
      bodyObject?.operationName !== 'PublishQuestionnaire' &&
      bodyObject?.operationName !== 'RollbackQuestionnaire' &&
      !this.isDeleteMutation(bodyObject) &&
      !this.hasValidGameUuid(bodyObject)
    ) {
      throw Error(
        `User not authorized for gameUuid ${bodyObject.variables.data.gameUuid}`
      );
    }

    // Add required fields for filtering
    if (this.isQuery(bodyObject)) {
      bodyObject = this.checkOrAddBodyObjectAttributes(bodyObject);
    } else {
      bodyObject = this.addEditedBy(bodyObject);
    }

    if (this.isCustomMutation(bodyObject)) {
      return this.handleCustomMutation(bodyObject);
    } else {
      if (this.isDeleteMutation(bodyObject)) {
        return this.deleteModel(bodyObject);
      }
      return this.redirect(this.MANAGE_PATH, JSON.stringify(bodyObject));
    }
  }

  private addRequiredFields(bodyObject: Record<string, any>) {
    if (!bodyObject.variables.data.uuid) {
      bodyObject.variables.data.uuid = uuidv4();
      console.log('UUID generated for model', bodyObject);
    }

    if (!bodyObject.variables.data.gameUuid) {
      bodyObject.variables.data.gameUuid = this.userService.getActiveGameId();
      console.log('GameUuid set for model', bodyObject);
    }
    return bodyObject;
  }

  private addEditedBy(bodyObject: Record<string, any>) {
    if (!bodyObject.variables.data) {
      bodyObject.variables.data = {};
    }
    bodyObject.variables.data.editedBy = this.userSub;

    return bodyObject;
  }

  private isCustomQuery(body: Record<string, any>) {
    return this.isInConfig(this.CUSTOM_QUERIES, body);
  }

  private isCustomMutation(body: Record<string, any>) {
    return this.isInConfig(this.CUSTOM_MUTATIONS, body);
  }

  private isInConfig(haystack: Record<string, any>, body: Record<string, any>) {
    return Object.keys(haystack).includes(body.operationName);
  }

  private async handleCustomQuery(path: string, body: string) {
    const bodyObject = JSON.parse(body);
    return filterResults(
      await this.CUSTOM_QUERIES[bodyObject.operationName](
        path,
        bodyObject,
        this.gameInstanceService.getGameInstance(
          bodyObject?.variables?.data?.gameUuid
        )
      ),
      this.userService.getUserGameIds()
    );
  }

  private handleCustomMutation(bodyObject: any) {
    return this.CUSTOM_MUTATIONS[bodyObject.operationName](
      this.MANAGE_PATH,
      bodyObject,
      this.gameInstanceService.getGameInstance(
        bodyObject.variables?.data?.gameUuid
      ),
      this.userService
    );
  }

  async redirect(path: string, body: string) {
    const instance = axios.create({
      baseURL: this.webinyEndpoint,
      timeout: 10000,
      headers: { Authorization: 'Bearer ' + this.webinyToken },
    });
    const res = await instance.post(path, body);
    return filterResults(res.data, this.userService.getUserGameIds());
  }

  isQuery(bodyObject: any) {
    return (
      bodyObject?.operationName.startsWith('Get') ||
      bodyObject?.operationName.startsWith('List')
    );
  }

  isDeleteMutation(bodyObject: any) {
    if (bodyObject?.query?.match(/mutation[\S\s]*delete[\S\s]*revision/)) {
      if (bodyObject?.operationName.startsWith('Delete')) {
        return true;
      } else
        throw Error(
          'All delete mutations must be named with syntax: Delete[Modelname]'
        );
    }
    return false;
  }

  hasValidGameUuid(bodyObject: any) {
    const { data } = bodyObject.variables;

    return Array.isArray(data)
      ? this.multiUpdateHasValidGameUuid(data)
      : this.userService.userHasGame(data?.gameUuid);
  }

  multiUpdateHasValidGameUuid(data: any[]) {
    return data.every(
      R.pipe(
        R.prop('gameUuid'),
        this.userService.userHasGame.bind(this.userService)
      )
    );
  }

  deleteModel(bodyObject: any) {
    const softDeleteService = new SoftDeleteService();
    const modelName = bodyObject.operationName.replace('Delete', '');
    return softDeleteService.deleteModel(
      bodyObject.variables.revision,
      modelName
    );
  }

  private checkOrAddBodyObjectAttributes(bodyObject: any) {
    console.debug('checkOrAddAttributes', JSON.stringify(bodyObject));
    if (bodyObject.query) {
      bodyObject.query = addQueryAttributes(bodyObject.query, [
        'deletedAt',
        'gameUuid',
      ]);
    }
    console.debug(
      'body after adding requested fields',
      JSON.stringify(bodyObject, null, 1)
    );
    return bodyObject;
  }

  private checkOrAddAttributes(body: string) {
    const bodyObject = JSON.parse(body);
    this.checkOrAddBodyObjectAttributes(bodyObject);
    return JSON.stringify(bodyObject);
  }
}
