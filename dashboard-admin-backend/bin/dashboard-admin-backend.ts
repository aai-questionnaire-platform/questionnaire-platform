#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DashboardAdminBackendStack } from '../lib/dashboard-admin-backend-stack';

//Create app and stack
const app = new cdk.App();
new DashboardAdminBackendStack(app, 'DashboardAdminBackend-dev', 'dev');
