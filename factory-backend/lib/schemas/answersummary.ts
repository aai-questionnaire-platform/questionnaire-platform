import { ModelOptions } from '@aws-cdk/aws-apigateway';

export function getAnswerSummaryModelOptions(): ModelOptions {
  return {
    schema: require('./answersummary.json'),
    contentType: 'application/json',
    description: 'Summary of answers to a category',
    modelName: 'AnswerSummary',
  };
}
