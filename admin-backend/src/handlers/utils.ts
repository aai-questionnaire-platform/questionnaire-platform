import * as R from 'ramda';
import { APIGatewayProxyEventHeaders } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import jwt_decode from 'jwt-decode';
import { AdminUserService } from '../services/admin-user-service';
import { GameInstanceService } from '../services/game-instance-service';
import { parseGameInstances } from '../services/utils';

/**
 * Get user id from a jwt token
 * @param token
 * @returns
 */
function getUserIdFromToken(token: string) {
  return jwt_decode<{ sub: string }>(token).sub;
}
/**
 * Get user id from a jwt token
 * @param token
 * @returns
 */
function getUsernameFromToken(token: string) {
  return jwt_decode<{ username: string }>(token).username;
}

/**
 * Get user id from Authorization header
 * @param headers
 * @returns
 */
export function getUserIdFromAuthHeader(headers: APIGatewayProxyEventHeaders) {
  try {
    return getUserIdFromToken(headers.Authorization!);
  } catch (e) {
    return undefined;
  }
}

/**
 * Get username from Authorization header
 * @param headers
 * @returns
 */
export function getUsenameFromAuthHeader(headers: APIGatewayProxyEventHeaders) {
  try {
    return getUsernameFromToken(headers.Authorization!);
  } catch (e) {
    return undefined;
  }
}

export async function getGameInstanceFromEnv(username: string) {
  const adminUserService = new AdminUserService(
    <string>process.env['AWS_ACCESS_KEY_ID'],
    <string>process.env['AWS_SECRET_ACCESS_KEY'],
    <string>process.env['AWS_SESSION_TOKEN'],
    <string>process.env['ADMIN_USER_POOL'],
    'eu-west-1'
  );
  await adminUserService.initUser(username);
  const gameInstanceService = new GameInstanceService(
    parseGameInstances(<string>process.env['GAME_INSTANCES']),
    adminUserService
  );
  //TODO if multiple game-instances is supported, gameInstanceService.getGameInstance(gameUuid) should be used
  return gameInstanceService.getDefaultGameInstance();
}

export const findFromUserAttributes = (
  attrName: string,
  subject: CognitoIdentityServiceProvider.AdminCreateUserResponse
) =>
  R.pipe<any, any, any, any>(
    R.path(['User', 'Attributes']),
    R.find(R.propEq('Name', attrName)),
    R.prop('Value')
  )(subject);
