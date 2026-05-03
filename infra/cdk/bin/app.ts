#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { DatabaseStack } from '../lib/database-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { CognitoStack } from '../lib/cognito-stack';
import { ApiGatewayStack } from '../lib/api-gateway-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'eu-west-1',
};

const networkStack = new NetworkStack(app, 'ProductServiceNetworkStack', { env });

const databaseStack = new DatabaseStack(app, 'ProductServiceDatabaseStack', {
  env,
  vpc: networkStack.vpc,
  dbSecurityGroup: networkStack.dbSecurityGroup,
});

const lambdaStack = new LambdaStack(app, 'ProductServiceLambdaStack', {
  env,
  vpc: networkStack.vpc,
  lambdaSecurityGroup: networkStack.lambdaSecurityGroup,
  dbSecret: databaseStack.dbSecret,
  dbHost: databaseStack.dbHost,
  dbPort: databaseStack.dbPort,
  dbName: databaseStack.dbName,
});

const cognitoStack = new CognitoStack(app, 'ProductServiceCognitoStack', { env });

new ApiGatewayStack(app, 'ProductServiceApiGatewayStack', {
  env,
  lambdaFunction: lambdaStack.lambdaFunction,
  userPool: cognitoStack.userPool,
  userPoolClient: cognitoStack.userPoolClient,
});
