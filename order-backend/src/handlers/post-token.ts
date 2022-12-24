
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AuthService } from '../services/auth-service';
import logger from '../services/log-service';
import {
  invalidRequestResponse,
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
} from './responses';

export const postToken = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'POST') {
      return methodNotSupportedResponse(method);
    }

    if (!event.body) {
      return invalidRequestResponse('code & state must be set in request body');
    }
    const body = JSON.parse(event.body);
    const { code, state } = body;

    if (!code || !state) {
      return invalidRequestResponse('code & state must be set in request body');
    }

    const authService = new AuthService();
    const token = await authService.getToken(code);

    return successResponse(token);
  } catch (error) {
    logger.error('Error', error);
    return serverErrorResponse(error as Error, 'Failed to submit token');
  }
};
