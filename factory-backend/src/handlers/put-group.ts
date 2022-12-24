import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ValidationError } from '../datamodels/error/validation-error';
import { PostGroupRequestBody } from '../datamodels/organizations';
import { GroupsService } from '../services/groups-service';
import {
  invalidRequestResponse,
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
} from './responses';

export async function putGroup(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const method = event.httpMethod;

    if (method !== 'PUT') {
      return methodNotSupportedResponse(method);
    }

    const group = JSON.parse(event.body!) as PostGroupRequestBody;

    console.debug(`putGroup ${{group}}`)

    await new GroupsService(
      process.env.GROUPS_TABLE_NAME as string
    ).updateGroup(group);

    return successResponse();
  } catch (error) {
    console.error('putGroup error', error);

    if (error instanceof ValidationError) {
      return invalidRequestResponse(error.message);
    }

    return serverErrorResponse(error as Error, 'Updating group failed:');
  }
}
