#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';

import { QuestionnaireFrontendStack } from '../lib/questionnaire-frontend-stack';

const app = new cdk.App();
const region = 'eu-west-1';

new QuestionnaireFrontendStack(app, 'QFFrontend-dev', 'dev', {
  env: { region: region },
});
