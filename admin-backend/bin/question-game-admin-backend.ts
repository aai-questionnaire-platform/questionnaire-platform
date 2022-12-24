#!/usr/bin/env node
import 'source-map-support/register';
import { QuestionGameAdminStackGenerator } from '../lib/question-game-admin-stack-generator';

//Create app and all the stacks
new QuestionGameAdminStackGenerator('MMK-QuestionnaireAdmin').generateStacks([
  'dev',
]);
