import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AnswersService } from '../services/answers-service';
import { GroupMembersService } from '../services/group-members-service';
import { ProgressService } from '../services/progress-service';
import { QuestionnaireService } from '../services/questionnaire-service';
import {
  invalidRequestResponse,
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
} from './responses';

export const getProgress = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'GET') {
      return methodNotSupportedResponse(method);
    }

    const {
      organization_ids,
      questionnaire_id,
      user_id = '',
    } = event.queryStringParameters!;

    console.debug(`getProgress ${{organization_ids}} ${{questionnaire_id}}`)

    const organizationIdList = organization_ids!.split(',').filter(Boolean);
    if (!organization_ids?.length) {
      return invalidRequestResponse(
        'you must specify at least 1 organization_id'
      );
    }

    const answersService = new AnswersService(
      process.env.ANSWERS_TABLE_NAME as string
    );

    const questionnaireService = new QuestionnaireService(
      process.env.ASSETS_BUCKET_NAME as string
    );

    const groupMembersService = new GroupMembersService(
      process.env.GROUP_MEMBERS_TABLE_NAME as string
    );

    const progressService = new ProgressService(
      process.env.PROGRESS_TABLE_NAME as string
    );

    let answers;

    if (user_id) {
      answers = await progressService.getProgress(
        answersService,
        questionnaireService,
        groupMembersService,
        questionnaire_id!,
        user_id,
        organizationIdList
      );
    } else {
      answers = await progressService.getProgressWithStatistics(
        answersService,
        questionnaireService,
        groupMembersService,
        questionnaire_id!,
        organizationIdList
      );
    }

    return successResponse(answers);
  } catch (error) {
    console.error('getProgress error', error);
    return serverErrorResponse(error as Error, 'Failed to get progress:');
  }
};
