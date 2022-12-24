import { ModelOptions } from '@aws-cdk/aws-apigateway';

export function getOrganizationsModelOptions(): ModelOptions {
  return {
    schema: require('./organizations.json'),
    contentType: 'application/json',
    description: 'Organization structure',
    modelName: 'Organizations',
  };
}

export function getGroupsModelOptions(): ModelOptions {
  return {
    schema: require('./groups.json'),
    contentType: 'application/json',
    description: 'Array of groups',
    modelName: 'Groups',
  };
}
