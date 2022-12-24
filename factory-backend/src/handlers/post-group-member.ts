import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PostGroupMemberRequestBody } from '../datamodels/group-member';
import { GroupMembersService } from '../services/group-members-service';
import {
  conflictResponse,
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
  unAuthorizedResponse,
} from './responses';
import { getUserIdFromAuthHeader } from './utils';

export const postGroupMember = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'POST') {
      return methodNotSupportedResponse(method);
    }

    const payload: PostGroupMemberRequestBody = JSON.parse(event.body || '{}');
    const currentUserId = getUserIdFromAuthHeader(event.headers);

    console.debug(`postGroupMember ${{currentUserId}} ${{payload}}`)

    if (currentUserId !== payload.user_id) {
      console.error(
        'User id in request',
        payload.user_id,
        "doesn't match the user id in the auth header",
        currentUserId
      );
      return unAuthorizedResponse();
    }

    await new GroupMembersService(
      process.env.GROUP_MEMBERS_TABLE_NAME as string
    ).addMemberToGroup(
      payload.user_id,
      payload.group,
      process.env.USER_SETTINGS_TABLE_NAME as string,
      process.env.ASSETS_BUCKET_NAME as string
    );
    return successResponse();
  } catch (error) {
    console.error('postGroupMember error', error);
    return serverErrorResponse(error as Error, 'Add member to group failed:');
  }
};
