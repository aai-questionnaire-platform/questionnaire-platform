import { ModelOptions } from '@aws-cdk/aws-apigateway';

export function getAnswerSetsModelOptions(): ModelOptions {
  return {
    schema: require('./answer-sets.json'),
    contentType: 'application/json',
    description: 'Array of AnswerSet-objects',
    modelName: 'AnswerSets',
  };
}
