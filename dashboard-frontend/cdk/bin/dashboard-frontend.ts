#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DashboardFrontendStack } from "../lib/dashboard-frontend-stack";

const app = new cdk.App();
const region = 'eu-west-1';

new DashboardFrontendStack(app, 'DashboardFrontend-dev', 'dev', {
  env: { region: region },
});

new DashboardFrontendStack(app, 'DashboardFrontend-test', 'test', {
  env: { region: region },
});
