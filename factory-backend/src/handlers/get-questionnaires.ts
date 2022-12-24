import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Locale } from '../Locale';
import { QuestionnaireService } from '../services/questionnaire-service';
import {
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
} from './responses';
import { valueFromEnum } from './utils';

export const getQuestionnaire = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    //Parse input
    const method = event.httpMethod;
    const locale = valueFromEnum(Locale, event.queryStringParameters!.locale);
    console.debug(`getQuestionnaire ${{locale}}`)

    if (method === 'GET') {
      const response = await new QuestionnaireService(
        process.env.ASSETS_BUCKET_NAME as string
      ).getQuestionnaire(locale);
      return successResponse(response);
    }

    // We only accept GET for now
    return methodNotSupportedResponse(method);
  } catch (error) {
    //Handle errors
    console.error('getQuestionnaire error', error);
    return serverErrorResponse(error as Error);
  }
};
