import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PostUser } from '../datamodels/user';
import { UserService } from '../services/user-service';
import { arrayToListString } from '../services/utils';
import {
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
} from './responses';
import {
  findFromUserAttributes,
  getGameInstanceFromEnv,
  getUsenameFromAuthHeader,
} from './utils';

export async function postUser(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const method = event.httpMethod;
    if (method !== 'POST') {
      return methodNotSupportedResponse(method);
    }

    const username: any = getUsenameFromAuthHeader(event.headers);

    const service = new UserService(
      <string>process.env['AWS_ACCESS_KEY_ID'],
      <string>process.env['AWS_SECRET_ACCESS_KEY'],
      <string>process.env['AWS_SESSION_TOKEN'],
      await getGameInstanceFromEnv(username),
      'eu-west-1'
    );

    const user = JSON.parse(event.body!) as PostUser;
    const { userId } = event.queryStringParameters || {};

    let responseUserId = user.id;

    if (userId) {
      await service.updateUser({
        username: user.email,
        name: user.name,
        organizationIds: user.organization_id,
        groupIds: arrayToListString(user.group_ids),
      });
    } else {
      const createResponse = await service.createUser(
        user.email,
        user.name,
        user.organization_id,
        user.group_ids
      );

      responseUserId = findFromUserAttributes('sub', createResponse);
    }

    return successResponse({ ok: true, user: { ...user, id: responseUserId } });
  } catch (error) {
    console.error('postUser():', error);
    return serverErrorResponse(error as Error);
  }
}
