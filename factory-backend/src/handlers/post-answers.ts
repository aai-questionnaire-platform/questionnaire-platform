import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as R from 'ramda';
import { AnswerSet } from '../datamodels/answer-set';
import { ValidationError } from '../datamodels/error/validation-error';
import { Organization } from '../datamodels/organizations';
import { Locale } from '../Locale';
import { validateHnAnswers } from '../services/answer-validation-service';
import { AnswersService } from '../services/answers-service';
import { OrganizationService } from '../services/organization-service';
import { QuestionnaireService } from '../services/questionnaire-service';
import {
  invalidRequestResponse,
  methodNotSupportedResponse,
  serverErrorResponse,
  successResponse,
  unAuthorizedResponse,
  validationFailedResponse,
} from './responses';
import { getUserIdFromAuthHeader } from './utils';

const MOCK_ORGANIZATION_KEYWORD = 'mock-organization';

export const postAnswers = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'POST') {
      return methodNotSupportedResponse(method);
    }

    const userId = getUserIdFromAuthHeader(event.headers);
    if (!userId) {
      return unAuthorizedResponse();
    }

    const answersService = new AnswersService(
      process.env.ANSWERS_TABLE_NAME as string
    );

    const questionnaireService = new QuestionnaireService(
      process.env.ASSETS_BUCKET_NAME as string
    );

    let answerSet = JSON.parse(event.body!) as AnswerSet;
    if (!answerSet.answers?.length) {
      return invalidRequestResponse('you need to submit some answers.');
    }

    console.debug(`postAnswers ${{userId}} ${{answerSet}}`)

    if (answerSet.key.organization_ids[0] === MOCK_ORGANIZATION_KEYWORD) {
      answerSet = await withOrganizationIdFromOnlyOrganization(answerSet);
    }

    //Invoke answers service. Rely on catch for errors.
    await answersService.answerQuestionnaire(
      questionnaireService,
      withUserId(answerSet, userId)
    );

    return successResponse();
  } catch (error) {
    console.error('postAnswers error', error);
    return serverErrorResponse(error as Error);
  }
};

export async function validateAnswerSet(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const method = event.httpMethod;

    if (method !== 'POST') {
      return methodNotSupportedResponse(method);
    }

    const questionnaireService = new QuestionnaireService(
      process.env.ASSETS_BUCKET_NAME as string
    );

    const questionnaire = await questionnaireService.getQuestionnaire(
      Locale.fi_FI
    );

    const answerSet = JSON.parse(event.body!) as AnswerSet;
    // run validations, throws if invalid
    validateHnAnswers(questionnaire.categories[0].questions, answerSet.answers);

    return successResponse({ ok: true });
  } catch (error) {
    console.error('validateAnswerSet error', error);

    if (error instanceof ValidationError) {
      return validationFailedResponse(error.message, { ok: false });
    }

    return serverErrorResponse(error as Error, 'Validation failed:');
  }
}

function withUserId(answerSet: AnswerSet, userId: string): AnswerSet {
  return R.set(R.lensPath(['key', 'user_id']), userId, answerSet);
}

async function withOrganizationIdFromOnlyOrganization(answerSet: AnswerSet) {
  const organizations = await new OrganizationService(
    process.env.ASSETS_BUCKET_NAME as string
  ).getOrganizations(Locale.fi_FI);
  const organization = organizations.organizations[0];
  return withOrganizationIds(answerSet, organization);
}

function withOrganizationIds(answerSet: AnswerSet, organization: Organization) {
  return R.set(
    R.lensPath(['key', 'organization_ids']),
    [organization.id, organization.children![0].id],
    answerSet
  );
}
