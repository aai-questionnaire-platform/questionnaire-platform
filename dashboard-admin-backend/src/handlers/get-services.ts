import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
} from './responses';
import * as services from '../services/services-service';
import logger from '../services/log-service';

export const getServices = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'GET') {
      return methodNotSupportedResponse(method);
    }

    const response = await services.getServices();

    return successResponse(response);
  } catch (error) {
    logger.error('Error', error);
    return serverErrorResponse(error as Error, 'Failed to get services:');
  }
};
