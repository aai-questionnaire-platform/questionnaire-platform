import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse } from './responses';

export const getTest = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const { locale } = event.queryStringParameters!;

  return successResponse({
    ok: true,
    message: `Hello from Admin backend in ${locale}`,
  });
};
