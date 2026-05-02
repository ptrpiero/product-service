import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpAlbIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

export interface ApiGatewayStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  internalAlbListener: elbv2.IApplicationListener;
}

export class ApiGatewayStack extends cdk.Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    // VPC Link connects API Gateway to the private ALB inside the VPC
    const vpcLink = new apigwv2.VpcLink(this, 'VpcLink', {
      vpc: props.vpc,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });

    const albIntegration = new HttpAlbIntegration(
      'AlbIntegration',
      props.internalAlbListener,
      { vpcLink },
    );

    // Catch-all proxy: all requests forwarded to the internal ALB
    const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      apiName: 'product-service-api',
      description: 'API Gateway HTTP API for Product Service',
      defaultIntegration: albIntegration,
    });

    this.apiUrl = httpApi.apiEndpoint;

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.apiEndpoint,
      description: 'API Gateway HTTP API URL',
      exportName: 'ProductServiceApiUrl',
    });
  }
}
