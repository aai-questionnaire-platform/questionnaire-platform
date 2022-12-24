import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserService } from '../services/user-service';
import { serverErrorResponse, successResponse } from './responses';
import { getGameInstanceFromEnv, getUsenameFromAuthHeader } from './utils';

export const getUsers = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { organizationId } = event.queryStringParameters!;

    const username: any = getUsenameFromAuthHeader(event.headers);

    const service = new UserService(
      <string>process.env['AWS_ACCESS_KEY_ID'],
      <string>process.env['AWS_SECRET_ACCESS_KEY'],
      <string>process.env['AWS_SESSION_TOKEN'],
      await getGameInstanceFromEnv(username),
      'eu-west-1'
    );

    const users = await service.readUsersByOrganization(<string>organizationId);

    return successResponse({
      ok: true,
      message: users,
    });
  } catch (error) {
    console.error('Error', error);
    return serverErrorResponse(error as Error);
  }
};
