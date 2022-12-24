import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AnswerSummaryService } from '../services/answer-summary-service';
import {
  invalidRequestResponse,
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
} from './responses';

export const getAnswerSummary = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    if (method === 'GET') {
      //Look up the minimum number of responses required to generate the summary
      const GROUP_ANSWER_COUNT_LIMIT: number = process.env
        .GROUP_ANSWER_COUNT_LIMIT as unknown as number;

      console.debug(
        'getAnswerSummary, response count minimum:',
        GROUP_ANSWER_COUNT_LIMIT
      );

      const { organization_ids, questionnaire_id, category_id } =
        event.queryStringParameters!;

      // decode organization_ids
      const organizationIdList = organization_ids!.split(',').filter(Boolean);
      if (!organizationIdList.length) {
        return invalidRequestResponse(
          'you must specify at least 1 organization_id'
        );
      }

      //Keep digging until enough responses have been collected
      const answers = await new AnswerSummaryService(
        process.env.ANSWERS_SUMMARY_TABLE_NAME as string
      ).getSummaryByMinNumberOfResponses(
        organizationIdList,
        questionnaire_id!,
        category_id!,
        GROUP_ANSWER_COUNT_LIMIT
      );

      // Delete completed_users as we don't want to expose user ids to client
      if (!answers) return successResponse();

      const { completed_users, ...answersWithoutCompletedUsers } = answers;
      return successResponse(answersWithoutCompletedUsers);
    }

    return methodNotSupportedResponse(method);
  } catch (error) {
    console.error('getAnswerSummary error', error);
    return serverErrorResponse(error as Error);
  }
};
