import {
  CognitoBaseService,
  CognitoUser,
  UserAttribute,
} from './cognito-base-service';
import { toStringSet } from './utils';

export class AdminUserService extends CognitoBaseService {
  private static GAME_IDS_ATTR_NAME = 'custom:game_ids';
  private user: CognitoUser;

  constructor(
    accessKeyId: string,
    secretAccessKey: string,
    sessionToken: string,
    private adminUserPoolId: string,
    region: string
  ) {
    super(accessKeyId, secretAccessKey, sessionToken, region);
  }

  async initUser(username: string) {
    if (!this.user) {
      console.log('get user from cognito');
      this.user = await this.getUser(username, this.adminUserPoolId);
      console.log('user', this.user);
    }
  }

  getActiveGameId() {
    return this.getUserGameIds()[0];
  }

  userHasGame(gameId: string) {
    if (this.user?.UserAttributes) {
      return this.user.UserAttributes.some(
        (attribute: UserAttribute) =>
          attribute.Name == AdminUserService.GAME_IDS_ATTR_NAME &&
          this.attributeHasValue(attribute.Value, gameId)
      );
    } else {
      throw Error('CognitoUser not initialized');
    }
  }

  getUserGameIds() {
    if (this.user?.UserAttributes) {
      return toStringSet(
        this.getAttribute(
          this.user.UserAttributes,
          AdminUserService.GAME_IDS_ATTR_NAME
        )
      );
    } else {
      throw Error('CognitoUser not initialized');
    }
  }
}
