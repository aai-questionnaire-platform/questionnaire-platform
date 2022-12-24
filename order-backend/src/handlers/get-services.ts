import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
  unAuthorizedResponse,
} from './responses';
import * as orderService from '../services/services-service';
import logger from '../services/log-service';
import { getUserIdFromAuthHeader } from './utils';

export const getServices = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'GET') {
      return methodNotSupportedResponse(method);
    }

    const userId = getUserIdFromAuthHeader(event.headers);
    if (!userId) {
      return unAuthorizedResponse();
    }

    const response = await orderService.getServices(userId);

    return successResponse(response);
  } catch (error) {
    logger.error('Error', error);
    return serverErrorResponse(error as Error, 'Failed to get services:');
  }
};
