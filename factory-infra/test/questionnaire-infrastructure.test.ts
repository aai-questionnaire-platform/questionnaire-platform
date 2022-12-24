import * as cdk from '@aws-cdk/core';
import * as QuestionnaireInfrastructure from '../lib/questionnaire-factory-infra-stack';

test('Stack Created', () => {
  new QuestionnaireInfrastructure.QuestionnaireFactoryInfraStack(
    new cdk.App(),
    'MyTestStack',
    'dev'
  );
});
