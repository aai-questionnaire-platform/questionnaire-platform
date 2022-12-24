import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as responses from './responses';
import { GroupMembersService } from '../services/group-members-service';

export const getGroupMembers = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'GET') {
      return responses.methodNotSupportedResponse(method);
    }

    const group_ids = event.queryStringParameters?.group_ids;
    if (!group_ids) {
      return responses.invalidRequestResponse('group_ids is required');
    }

    console.debug(`getGroupMembers ${{group_ids}}`)

    const createGetMembers = (groupId: string) =>
      new GroupMembersService(
        process.env.GROUP_MEMBERS_TABLE_NAME as string
      ).getGroupMembers(groupId);

    const promises = group_ids.split(',').map(createGetMembers);
    const promisesResult = await Promise.all(promises);
    const groupMembers = promisesResult.flat();

    return responses.successResponse({ groupMembers: groupMembers.length });
  } catch (error) {
    console.error('getGroupMembers error', error);
    return responses.serverErrorResponse(
      error as Error,
      'Getting group members failed:'
    );
  }
};
