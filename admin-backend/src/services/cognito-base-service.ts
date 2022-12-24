import AWS from 'aws-sdk';
import * as R from 'ramda';
export interface UserAttribute {
  Name: string;
  Value: string;
}

export interface CognitoUser {
  Username: string;
  Attributes: Array<UserAttribute>;
  UserAttributes?: Array<UserAttribute>;
}
export class CognitoBaseService {
  cognitoClient: AWS.CognitoIdentityServiceProvider;

  constructor(
    private accessKeyId: string,
    private secretAccessKey: string,
    private sessionToken: string,
    private region: string
  ) {
    this.cognitoClient = this.createCognitoClient();
  }

  private createCognitoClient(): any {
    return new AWS.CognitoIdentityServiceProvider({
      credentials: new AWS.Credentials(
        this.accessKeyId,
        this.secretAccessKey,
        this.sessionToken
      ),
      region: this.region,
    });
  }

  protected attributeHasValue(attributes: any, value: string) {
    return attributes
      .split(',')
      .some((attribute: string) => attribute.trim() == value);
  }

  protected getAttribute(attrs: UserAttribute[], name: string) {
    return R.find(R.propEq('Name', name), attrs)?.Value;
  }

  protected async readAllUsers(gameAdminUserPoolId: string) {
    return new Promise((resolve, reject) => {
      this.cognitoClient.listUsers(
        {
          UserPoolId: gameAdminUserPoolId,
        },
        (err, data) => {
          if (err) {
            console.error('listUsers error', err);
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  }

  async getUser(username: string, userPoolId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cognitoClient.adminGetUser(
        {
          UserPoolId: userPoolId,
          Username: username,
        },
        (err, data) => {
          if (err) {
            console.error('getUser error', err);
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  }
}
