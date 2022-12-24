import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Questionnaire } from '../datamodels/questionnaire';
import { QuestionnaireService } from '../services/questionnaire-service';
import {
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
} from './responses';

export async function postQuestionnaire(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    console.log('postQuestionnaire', JSON.stringify(event.body));
    const method = event.httpMethod;
    if (method !== 'POST') {
      return methodNotSupportedResponse(method);
    }
    const questionnaire = JSON.parse(event.body!) as Questionnaire;
    console.debug(`postQuestionnaire ${{questionnaire}}`)
    await new QuestionnaireService(
      process.env.ASSETS_BUCKET_NAME as string
    ).postQuestionnaire(questionnaire);
    return successResponse();
  } catch (error) {
    console.error('postQuestionnaire error', error);
    return serverErrorResponse(error as Error);
  }
}
