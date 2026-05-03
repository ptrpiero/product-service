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
  public readonly apiDomainName: string;

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

    const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      apiName: 'product-service-api',
      description: 'API Gateway HTTP API for Product Service',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigwv2.CorsHttpMethod.ANY],
        allowHeaders: ['Authorization', 'Content-Type'],
        maxAge: cdk.Duration.days(1),
      },
    });

    // OPTIONS intentionally excluded — corsPreflight handles it natively without JWT check
    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [
        apigwv2.HttpMethod.GET,
        apigwv2.HttpMethod.POST,
        apigwv2.HttpMethod.PUT,
        apigwv2.HttpMethod.PATCH,
        apigwv2.HttpMethod.DELETE,
        apigwv2.HttpMethod.HEAD,
      ],
      integration: lambdaIntegration,
      authorizer,
    });

    // Unprotected routes for Swagger UI (no JWT auth)
    httpApi.addRoutes({
      path: '/api-doc',
      methods: [apigwv2.HttpMethod.GET],
      integration: lambdaIntegration,
    });
    httpApi.addRoutes({
      path: '/api-doc/{proxy+}',
      methods: [apigwv2.HttpMethod.GET],
      integration: lambdaIntegration,
    });

    this.apiUrl = httpApi.apiEndpoint;
    this.apiDomainName = cdk.Fn.select(2, cdk.Fn.split('/', httpApi.apiEndpoint));

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.apiEndpoint,
      description: 'API Gateway HTTP API URL',
      exportName: 'ProductServiceApiUrl',
    });
  }
}
