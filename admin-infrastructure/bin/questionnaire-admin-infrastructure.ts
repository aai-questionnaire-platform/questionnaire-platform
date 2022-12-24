#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { QuestionnaireAdminInfrastructureStack } from "../lib/questionnaire-admin-infrastructure-stack";

const app = new cdk.App();

new QuestionnaireAdminInfrastructureStack(
  app,
  "QuestionnaireAdminInfrastructureStack-dev",
  "dev"
);