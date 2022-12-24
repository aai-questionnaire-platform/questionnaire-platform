#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { QuestionnaireFactoryBackend } from '../lib/questionnaire-factory-backend';

//Create app and stack
const app = new cdk.App();

new QuestionnaireFactoryBackend(app, 'dev');

