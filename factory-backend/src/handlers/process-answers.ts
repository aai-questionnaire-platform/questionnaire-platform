import { DynamoDBStreamEvent } from 'aws-lambda';
import { AnswerSummaryService } from '../services/answer-summary-service';
import { AttributeService } from '../services/attribute-service';
import { QuestionnaireService } from '../services/questionnaire-service';

/**
 * Processes individual answers from dynamodb stream events to insert them
 * to answer summaries.
 * @param event
 */
const processAnswers = async (event: DynamoDBStreamEvent) => {
  try {
    const questionnaire = await new QuestionnaireService(
      process.env.ASSETS_BUCKET_NAME as string
    ).getQuestionnaire();

    const service = new AnswerSummaryService(
      process.env.ANSWERS_SUMMARY_TABLE_NAME as string
    );

    for (const record of event.Records) {
      if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
        await service.insertSummaries(record, questionnaire);
      }
    }
  } catch (error) {
    console.error('processAnswers error', error);
  }
};

const generateAttribute = async (event: DynamoDBStreamEvent) => {
  try {
    const service = new AttributeService(
      process.env.ATTRIBUTE_TABLE_NAME as string,
      process.env.AAI_ATTRIBUTES as string
    );

    for (const record of event.Records) {
      if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
        await service.setAttribute(record);
      }
    }
  } catch (error) {
    console.error('generateAttribute error', error);
  }
};

export { processAnswers, generateAttribute };
