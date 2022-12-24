import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  invalidRequestResponse,
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
} from './responses';
import * as services from '../services/services-service';
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
      const servicesList = JSON.parse(body).services;
      const response = await services.saveServices(servicesList);
      return successResponse(response);
    } else {
      return invalidRequestResponse(
        'You need to specify services in the request body'
      );
    }
  } catch (error) {
    logger.error('Error', error);
    return serverErrorResponse(error as Error, 'Failed to get services:');
  }
};
