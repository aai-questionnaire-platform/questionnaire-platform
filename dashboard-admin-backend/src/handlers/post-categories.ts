import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  invalidRequestResponse,
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
} from './responses';
import * as categories from '../services/categories-service';
import logger from '../services/log-service';

export const postServices = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'POST') {
      return methodNotSupportedResponse(method);
    }

    const { body } = event;
    if (body) {
      const categoriesList = JSON.parse(body).categories;
      const response = await categories.saveCategories(categoriesList);
      return successResponse(response);
    } else {
      return invalidRequestResponse(
        'You need to specify categories in the request body'
      );
    }
  } catch (error) {
    logger.error('Error', error);
    return serverErrorResponse(error as Error, 'Failed to get categories:');
  }
};
