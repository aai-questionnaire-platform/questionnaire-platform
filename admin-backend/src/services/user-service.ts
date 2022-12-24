import { CognitoIdentityServiceProvider } from 'aws-sdk';
import * as R from 'ramda';
import { GameInstance } from '../datamodels/game-instance';
import { UpdateUserProps, User } from '../types';
import {
  CognitoBaseService,
  CognitoUser,
  UserAttribute,
} from './cognito-base-service';
import { arrayToListString, toStringSet } from './utils';

export class UserService extends CognitoBaseService {
  private static ORGANIZATION_IDS_ATTR_NAME = 'custom:organization_ids';
  private static GROUP_IDS_ATTR_NAME = 'custom:group_ids';

  constructor(
    accessKeyId: string,
    secretAccessKey: string,
    sessionToken: string,
    private gameInstance: GameInstance,
    region: string
  ) {
    super(accessKeyId, secretAccessKey, sessionToken, region);
  }

  private userHasOrganization(user: CognitoUser, organizationId: string) {
    return user.Attributes.some(
      (attribute: UserAttribute) =>
        attribute.Name == UserService.ORGANIZATION_IDS_ATTR_NAME &&
        this.attributeHasValue(attribute.Value, organizationId)
    );
  }

  private userHasGroup(user: CognitoUser, groupId: string) {
    return user.Attributes.some(
      (attribute: UserAttribute) =>
        attribute.Name == UserService.GROUP_IDS_ATTR_NAME &&
        this.attributeHasValue(attribute.Value, groupId)
    );
  }

  async readUsersByOrganization(organizationId: string): Promise<User[]> {
    const allUsers: any = await this.readAllUsers(
      this.gameInstance.gameAdminUserPoolId
    );
    return allUsers.Users.filter(
      (user: CognitoUser) =>
        organizationId && this.userHasOrganization(user, organizationId)
    ).map((cognitoUser: CognitoUser) =>
      this.convertCognitoUserToUser(cognitoUser)
    );
  }

  async readUsersByGroup(groupId: string) {
    const allUsers: any = await this.readAllUsers(
      this.gameInstance.gameAdminUserPoolId
    );
    return allUsers.Users.filter(
      (user: CognitoUser) => groupId && this.userHasGroup(user, groupId)
    ).map((cognitoUser: CognitoUser) =>
      this.convertCognitoUserToUser(cognitoUser)
    );
  }

  private convertCognitoUserToUser(cognitoUser: CognitoUser): User {
    return {
      id: this.getAttribute(cognitoUser.Attributes, 'sub')!,
      email: cognitoUser.Username,
      name: this.getAttribute(cognitoUser.Attributes, 'name')!,
      group_ids: this.getUserGroupIds(cognitoUser),
    };
  }

  private getUserGroupIds(cognitoUser: CognitoUser) {
    return toStringSet(
      this.getAttribute(cognitoUser.Attributes, UserService.GROUP_IDS_ATTR_NAME)
    );
  }

  async createUser(
    username: string,
    name: string,
    organizationIds?: string,
    groupIds?: string[]
  ): Promise<CognitoIdentityServiceProvider.AdminCreateUserResponse> {
    const attributes: any = [];

    if (organizationIds) {
      attributes.push({
        Name: UserService.ORGANIZATION_IDS_ATTR_NAME,
        Value: organizationIds,
      });
    }
    if (groupIds) {
      attributes.push({
        Name: UserService.GROUP_IDS_ATTR_NAME,
        Value: arrayToListString(groupIds),
      });
    }

    attributes.push({
      Name: 'name',
      Value: name,
    });

    attributes.push({
      Name: 'email',
      Value: username,
    });

    return new Promise((resolve, reject) => {
      this.cognitoClient.adminCreateUser(
        {
          UserPoolId: this.gameInstance.gameAdminUserPoolId,
          Username: username,
          UserAttributes: attributes,
          DesiredDeliveryMediums: ['EMAIL'],
        },
        (err, data) => {
          if (err) {
            console.error('createUser error', err);
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  }

  /**
   * Update user's cognito custom attributes.
   * @param userName
   * @param groupUuid
   * @param groupIds
   */
  async updateUser(userDto: UpdateUserProps) {
    const attributes: any = [];

    if (userDto.organizationIds != undefined) {
      attributes.push({
        Name: UserService.ORGANIZATION_IDS_ATTR_NAME,
        Value: userDto.organizationIds,
      });
    }

    if (userDto.groupIds != undefined) {
      attributes.push({
        Name: UserService.GROUP_IDS_ATTR_NAME,
        Value: userDto.groupIds,
      });
    }

    if (userDto.name !== undefined) {
      attributes.push({
        Name: 'name',
        Value: userDto.name,
      });
    }

    if (!attributes.length) {
      return undefined;
    }

    return new Promise((resolve, reject) => {
      this.cognitoClient.adminUpdateUserAttributes(
        {
          UserPoolId: this.gameInstance.gameAdminUserPoolId,
          Username: userDto.username,
          UserAttributes: attributes,
        },
        (err, data) => {
          if (err) {
            console.error('updateUser error', err);
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  }

  /**
   * Unlink user and a group. Updates user's groups attribute in cognito with a list of group uuids without the given group's uuid.
   * @param userName
   * @param groupUuid
   * @param groupIds
   */
  async removeUserFromGroup(
    username: string,
    groupUuid: string,
    groupIds: string[]
  ) {
    if (groupUuid && groupIds.length) {
      const updatedGroups = R.without([groupUuid], groupIds);
      this.updateUser({ username, groupIds: arrayToListString(updatedGroups) });
    }
  }
}
