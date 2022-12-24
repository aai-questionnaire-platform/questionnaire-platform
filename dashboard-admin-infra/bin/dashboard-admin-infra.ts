#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { DashboardAdminInfraStack } from '../lib/dashboard-admin-infra-stack';

const app = new cdk.App();

new DashboardAdminInfraStack(app, 'DashboardAdminInfraStack-dev', 'dev');
