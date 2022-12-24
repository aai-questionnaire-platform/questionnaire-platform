import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Locale } from '../Locale';
import { OrganizationService } from '../services/organization-service';
import {
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
} from './responses';
import { valueFromEnum } from './utils';

export const getOrganizations = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    const locale = valueFromEnum(Locale, event.queryStringParameters!.locale);
    console.debug(`getOrganizations ${{locale}}`)
    if (method === 'GET') {
      const response = await new OrganizationService(
        process.env.ASSETS_BUCKET_NAME as string
      ).getOrganizations(locale);

      return successResponse(response);
    }
    // We only accept GET
    return methodNotSupportedResponse(method);
  } catch (error) {
    console.error('getOrganizations error', error);
    return serverErrorResponse(error as Error);
  }
};
