#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { QuestionnaireFactoryInfraStack } from '../lib/questionnaire-factory-infra-stack';

const app = new cdk.App();

new QuestionnaireFactoryInfraStack(app, 'dev');

