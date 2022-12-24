import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
  unAuthorizedResponse,
} from '../responses';
import { getUserIdFromAuthHeader } from '../utils';
import { AttributeService } from '../../services/attribute-service';

export const deleteUserAttributes = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    console.log(event);
    if (method !== 'DELETE') {
      return methodNotSupportedResponse(method);
    }

    const user_id = getUserIdFromAuthHeader(event.headers);
    if (!user_id) {
      return unAuthorizedResponse();
    }

    const response = await new AttributeService(
      process.env.ATTRIBUTE_TABLE_NAME as string
    ).deleteAttributes(user_id);

    return successResponse(response);
  } catch (error) {
    console.error('deleteUserAttributes error', error);
    return serverErrorResponse(
      error as Error,
      'Deleting aai attributes failed:'
    );
  }
};
