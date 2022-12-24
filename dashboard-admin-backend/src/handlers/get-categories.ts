import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
} from './responses';
import * as categories from '../services/categories-service';
import logger from '../services/log-service';

export const getCategories = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'GET') {
      return methodNotSupportedResponse(method);
    }

    const response = await categories.getCategories();

    return successResponse(response);
  } catch (error) {
    logger.error('Error', error);
    return serverErrorResponse(error as Error, 'Failed to get services:');
  }
};
