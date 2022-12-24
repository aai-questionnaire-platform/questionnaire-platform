import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GroupsService } from '../services/groups-service';
import {
  invalidRequestResponse,
  methodNotSupportedResponse,
  resourceNotFoundResponse,
  serverErrorResponse,
  successResponse,
} from './responses';

export const getGroups = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'GET') {
      return methodNotSupportedResponse(method);
    }

    const { parent_organization_id, pin } = event.queryStringParameters ?? {};

    if (!parent_organization_id && !pin) {
      return invalidRequestResponse(
        'Missing search parameter [parent_organization_id|pin]'
      );
    }

    console.debug(`getGroups ${{parent_organization_id}}`)

    const service = new GroupsService(process.env.GROUPS_TABLE_NAME as string);

    let response;

    if (parent_organization_id) {
      response = await service.getGroupsByParentId(parent_organization_id);
    } else if (pin) {
      response = await service.getGroupByPin(pin);

      if (!response) {
        return resourceNotFoundResponse();
      }
    }

    return successResponse(response);
  } catch (error) {
    console.error(`getGroups error ${error}`);

    return serverErrorResponse(error as Error);
  }
};
