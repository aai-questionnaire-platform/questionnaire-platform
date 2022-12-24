import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserSettingsService } from '../services/user-settings-service';
import {
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
  unAuthorizedResponse,
} from './responses';
import { getUserIdFromAuthHeader, getUserIdFromToken } from './utils';

export const getUserSettings = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'GET') {
      return methodNotSupportedResponse(method);
    }

    const user_id = getUserIdFromAuthHeader(event.headers);
    if (!user_id) {
      return unAuthorizedResponse();
    }
    console.debug(`getUserSettings ${{user_id}}`)
    const settings = await new UserSettingsService(
      process.env.USER_SETTINGS_TABLE_NAME as string
    ).getUserSettings(user_id);

    return successResponse(settings);
  } catch (error) {
    console.error('getUserSettings error', error);
    return serverErrorResponse(error as Error, 'Getting user settings failed:');
  }
};
