import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AnswerSetKey } from '../datamodels/answer-set';
import { AnswersService } from '../services/answers-service';
import {
  invalidRequestResponse,
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
  unAuthorizedResponse,
} from './responses';
import { getUserIdFromAuthHeader } from './utils';

export const getAnswers = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    //Parse input
    const method = event.httpMethod;

    //Evaluate
    if (method !== 'GET') {
      return methodNotSupportedResponse(method);
    }

    const user_id = getUserIdFromAuthHeader(event.headers);
    if (!user_id) {
      return unAuthorizedResponse();
    }

    const { organization_ids, questionnaire_id } = event.queryStringParameters!;
    console.debug(`getAnswers ${{organization_ids}} ${{questionnaire_id}}`)

    // decode organization_ids
    const organizationIdList = organization_ids!.split(',').filter(Boolean);
    if (!organizationIdList.length) {
      return invalidRequestResponse(
        'you must specify at least 1 organization_id'
      );
    }

    const key: AnswerSetKey = {
      organization_ids: organizationIdList,
      questionnaire_id: questionnaire_id!,
      user_id: user_id,
    };

    const answers = await new AnswersService(
      process.env.ANSWERS_TABLE_NAME as string
    ).getAnswerSet(key);

    return successResponse(answers || {});
  } catch (error) {
    //Handle errors
    console.error('getAnswers error', error);
    return serverErrorResponse(error as Error, 'Getting answers failed:');
  }
};
