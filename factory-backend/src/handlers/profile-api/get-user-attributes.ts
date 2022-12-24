import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
  unAuthorizedResponse,
} from '../responses';
import { getUserIdFromAuthHeader } from '../utils';
import { AttributeService } from "../../services/attribute-service";

export const getUserAttributes = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod

    console.log(event);
    if (method !== 'GET') {
      return methodNotSupportedResponse(method);
    }

    const user_id = getUserIdFromAuthHeader(event.headers);
    if (!user_id) {
      return unAuthorizedResponse();
    }

    const attribute = await new AttributeService(
      process.env.ATTRIBUTE_TABLE_NAME as string
    ).getAttributes(user_id);

    return successResponse(attribute);
  } catch (error) {
    console.error('getUserAttributes(): ', error);
    return serverErrorResponse(error as Error, 'Getting aai attributes failed:');
  }
};
