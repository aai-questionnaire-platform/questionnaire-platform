import { JsonSchemaType, ModelOptions } from '@aws-cdk/aws-apigateway';

export function getAnswerSetModelOptions(): ModelOptions {
  return {
    schema: require('./answer-set.json'),
    contentType: 'application/json',
    description: 'Required keys and list of answers to a questionnaire',
    modelName: 'AnswerSet',
  };
}
