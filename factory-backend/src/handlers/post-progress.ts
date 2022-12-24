import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ValidationError } from '../datamodels/error/validation-error';
import { ProgressService } from '../services/progress-service';
import { QuestionnaireService } from '../services/questionnaire-service';
import {
  invalidRequestResponse,
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
} from './responses';

export const postProgress = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'POST') {
      return methodNotSupportedResponse(method);
    }

    const { category_id, organization_ids, questionnaire_id, status } =
      JSON.parse(event.body!);

    console.debug(`postProgress ${{category_id}} ${{organization_ids}} ${{questionnaire_id}} ${{status}}`)

    // decode organization_ids, if given
    const organizationIdList = organization_ids!.filter(Boolean);

    if (!organizationIdList.length) {
      return invalidRequestResponse(
        'you must specify at least 1 organization_id'
      );
    }

    const questionnaireService = new QuestionnaireService(
      process.env.ASSETS_BUCKET_NAME as string
    );

    //Invoke progress service to persist data. Rely on catch for errors.
    await new ProgressService(
      process.env.PROGRESS_TABLE_NAME as string
    ).updateProgress(
      questionnaireService,
      organizationIdList,
      category_id!,
      questionnaire_id!,
      +status!
    );

    return successResponse();
  } catch (error) {
    console.error('postProgress():', error);

    if (error instanceof ValidationError) {
      return invalidRequestResponse(error.message);
    }

    return serverErrorResponse(error as Error, 'Failed to update progress:');
  }
};
