import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { HttpJwtAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';

export interface ApiGatewayStackProps extends cdk.StackProps {
  lambdaFunction: lambda.IFunction;
  userPool: cognito.IUserPool;
  userPoolClient: cognito.IUserPoolClient;
}

export class ApiGatewayStack extends cdk.Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    const lambdaIntegration = new HttpLambdaIntegration(
      'LambdaIntegration',
      props.lambdaFunction,
    );

    const authorizer = new HttpJwtAuthorizer(
      'CognitoAuthorizer',
      `https://cognito-idp.${this.region}.amazonaws.com/${props.userPool.userPoolId}`,
      { jwtAudience: [props.userPoolClient.userPoolClientId] },
    );

    // Catch-all proxy: all requests forwarded to Lambda
    const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      apiName: 'product-service-api',
      description: 'API Gateway HTTP API for Product Service',
      defaultIntegration: lambdaIntegration,
      defaultAuthorizer: authorizer,
    });

    this.apiUrl = httpApi.apiEndpoint;

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.apiEndpoint,
      description: 'API Gateway HTTP API URL',
      exportName: 'ProductServiceApiUrl',
    });
  }
}
