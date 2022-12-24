import { ModelOptions } from '@aws-cdk/aws-apigateway';

export function getQuestionnaireModelOptions(): ModelOptions {
  return {
    schema: require('./questionnaire.json'),
    contentType: 'application/json',
    description: 'A set of questions',
    modelName: 'Questionnaire',
  };
}
export function getPostQuestionnaireRequestModelOptions(): ModelOptions {
  return {
    schema: require('./questionnaire.json'),
    contentType: 'application/json',
    description: 'New questionnaire-json',
    modelName: 'PostQuestionnaireRequest',
  };
}
