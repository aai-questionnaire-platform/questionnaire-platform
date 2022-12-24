import { ModelOptions } from '@aws-cdk/aws-apigateway';

export function getPostGroupMemberRequest(): ModelOptions {
  return {
    schema: require('./postgroupmemberrequest.json'),
    contentType: 'application/json',
    description: 'Request for linking a user and a group',
    modelName: 'PostGroupMemberRequestBody',
  };
}
