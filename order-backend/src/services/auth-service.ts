import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { AuthorizationCode } from 'simple-oauth2';
import { AaiToken } from '../datamodels/aai-token';
import logger from '../services/log-service';
import { UserAttributeService } from './user-attribute-service';
import { decode } from 'jsonwebtoken';
import { listItems } from '../aws-wrappers/read-items-from-table';
export class AuthService {
  private getConfig() {
    return {
      client: {
        id: <string>process.env.AAI_CLIENTID,
        secret: <string>process.env.AAI_CLIENTSECRET,
      },
      auth: {
        tokenHost: <string>process.env.AAI_LOGIN_URL,
      },
    };
  }

  async getToken(code: string): Promise<any> {
    const client = new AuthorizationCode(this.getConfig());
    const tokenParams = {
      code,
      redirect_uri: <string>process.env.AAI_LOGIN_REDIRECT_URL,
      scope: 'scope',
    };

    logger.debug('reading token');

    try {
      const response: any = await client.getToken(tokenParams);
      logger.debug('got token', response);
      const userAttributeService = new UserAttributeService();
      const userAttributesResponse =
        await userAttributeService.readUserAttribute(
          response.token.access_token
        );

      if (UserAttributeService.isUserAttributeValid(userAttributesResponse)) {
        await this.saveToken(response.token, userAttributesResponse);
        logger.debug('token&user attribute saved to db');
        return { token: response.token.id_token };
      } else {
        return { error: 'NO_VALID_USER_ATTRIBUTE' };
      }
    } catch (error) {
      logger.debug('Access token/user attribute error', error);
      throw Error('Access token/user attribute error, user not authorized');
    }
  }

  async saveToken(token: AaiToken, userAttributesResponse: any) {
    let userAttributes = 'N/A';
    if (typeof userAttributesResponse === 'object') {
      userAttributes = JSON.stringify(userAttributesResponse);
    }
    const idTokenDecoded: any = decode(token.id_token, { complete: true });

    logger.debug('save token and user attributes', token, userAttributes);
    const tableName = process.env.TOKEN_TABLE_NAME as string;
    const putCommand = new UpdateItemCommand({
      TableName: tableName,
      Key: {
        id_token: { S: token.id_token },
      },
      UpdateExpression:
        'SET original_token = :original_token, expires_at = :expires_at, user_attributes = :user_attributes',
      ExpressionAttributeValues: {
        ':original_token': { S: JSON.stringify(token) },
        ':expires_at': { N: `${idTokenDecoded.payload.exp}` },
        ':user_attributes': { S: userAttributes },
      },
    });
    try {
      const client = new DynamoDBClient({ region: 'eu-west-1' });
      const data = await client.send(putCommand);
      logger.debug('Success - token added or updated', data);
      return data;
    } catch (err: any) {
      logger.debug('Error', err.stack);
      return err;
    }
  }

  async readTokenFromDB(idToken: string) {
    const tableName = process.env.TOKEN_TABLE_NAME as string;
    try {
      const params = {
        TableName: tableName,
        KeyConditionExpression: `id_token=:token`,
        ExpressionAttributeValues: {
          ':token': { S: idToken },
        },
      };

      const items: any = await listItems(params);

      logger.debug('found from db', items[0]);

      return {
        token: JSON.parse(items[0].original_token.S),
        user_attributes: JSON.parse(items[0].user_attributes.S),
      };
    } catch (err) {
      logger.error('readToken():', err, tableName);
      throw err;
    }
  }

  // Reads token from db and checks user attribute
  // User is authorized when:
  // 1. AAI-roken and user attribute can be found from db by idToken (authorization header from api-call)
  // 2. User attribute stored in db is valid
  async isUserAuthorized(idToken: string): Promise<boolean> {
    try {
      const token = await this.readTokenFromDB(idToken);
      return UserAttributeService.isUserAttributeValid(token.user_attributes);
    } catch (err) {
      logger.error('Checking user attribute failed', err);
      return false;
    }
  }

  // If refresh of acces_token (used in AAI-api calls) is needed, use this
  async refreshToken(idToken: string): Promise<any> {
    try {
      const client = new AuthorizationCode(this.getConfig());

      const dbtoken = await this.readTokenFromDB(idToken);
      const token = dbtoken.token;
      logger.debug('got token from db', token);
      let accessToken = client.createToken(token);
      const EXPIRATION_WINDOW_IN_SECONDS = 300; // Window of time before the actual expiration to refresh the token
      if (accessToken.expired(EXPIRATION_WINDOW_IN_SECONDS)) {
        try {
          const refreshParams = {
            grant_type: 'refresh_token',
            redirect_uri: <string>process.env.AAI_LOGIN_REDIRECT_URL,
            refresh_token: token.refresh_token,
            scope: 'openid tampere_demo_flag',
          };

          const newToken: any = await accessToken.refresh(refreshParams);
          logger.debug('refreshed, new accessToken:', newToken);
          await this.saveToken(newToken.token, dbtoken.user_attributes);
          logger.debug('new token saved');
          return { token: newToken.token.id_token };
        } catch (error) {
          logger.error('Error refreshing access token: ', error);
          throw new Error('Token refresh failed');
        }
      } else {
        logger.debug('token not expired');
      }
    } catch (error) {
      logger.error('Access Token Error', error);
      throw new Error('Token refresh error, see logs for details');
    }
  }
}
