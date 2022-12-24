#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { OrderBackendStack } from '../lib/order-backend-stack';

//Create app and stack
const app = new cdk.App();
new OrderBackendStack(app, 'OrderBackend-dev', 'dev');
