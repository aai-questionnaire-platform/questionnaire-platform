import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PostGroupRequestBody } from '../datamodels/organizations';
import { GroupsService } from '../services/groups-service';
import {
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
} from './responses';

export async function postGroup(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const method = event.httpMethod;
    if (method !== 'POST') {
      return methodNotSupportedResponse(method);
    }

    const service = new GroupsService(process.env.GROUPS_TABLE_NAME as string);
    const group = JSON.parse(event.body!) as PostGroupRequestBody;
    console.debug(`postGroup ${{group}}`)
    await service.createNewGroup(group);
    return successResponse();
  } catch (error) {
    console.error('postGroup error', error);
    return serverErrorResponse(error as Error);
  }
}
