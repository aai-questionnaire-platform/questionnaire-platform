import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserSettingsService } from '../services/user-settings-service';
import {
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
  unAuthorizedResponse,
} from './responses';
import { getUserIdFromToken } from './utils';

export const postUserSettings = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'POST') {
      return methodNotSupportedResponse(method);
    }

    const user_id = getUserIdFromToken(event.headers['authorization']);
    if (!user_id) {
      return unAuthorizedResponse();
    }

    console.debug(`postUserSettings ${{user_id}}`)

    await new UserSettingsService(
      process.env.USER_SETTINGS_TABLE_NAME as string
    ).saveUserSettings(user_id, JSON.parse(event.body!));

    return successResponse();
  } catch (error) {
    console.error('postUserSettings error', error);
    return serverErrorResponse(error as Error, 'Saving user settings failed:');
  }
};
