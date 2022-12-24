//vpc-stack.ts
import * as s3 from '@aws-cdk/aws-s3';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { Distribution, OriginAccessIdentity } from '@aws-cdk/aws-cloudfront';
import { S3Origin } from '@aws-cdk/aws-cloudfront-origins';
import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { CfnOutput, Construct, Stack, StackProps } from '@aws-cdk/core';
import { ApiGatewayHelper } from './apigw-helper';
import { Authorizer } from '@aws-cdk/aws-apigateway';

export class OrderInfraStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    envName: string,
    props?: StackProps
  ) {
    super(scope, id, props);

    const params: EnvParams = {
      hostedZoneId: 'hostedZoneId',
      hostname: 'palvelutilaus-' + envName,
      zonename: 'yourdomain.fi',
      publicCertRef: 'arn:aws:acm:us-east-1:ACCOUNTID:certificate/CERTID',
    };

    const frontendBucketName = `order-frontend-${envName}`;
    const s3BucketName = `OrderAssets-${envName}`;
    const codeTableName = `CodeTable-${envName}`;
    const orderTableName = `OrderTable-${envName}`;
    const tokenTableName = `TokenTable-${envName}`;
    const walletTableName = `WalletTable-${envName}`;

    const s3bucket = new s3.Bucket(this, s3BucketName, {
      bucketName: s3BucketName.toLowerCase(),
      versioned: true,
    });

    const frontendBucket = new s3.Bucket(this, frontendBucketName, {
      bucketName: frontendBucketName,
      versioned: false,
    });

    const certificate = Certificate.fromCertificateArn(
      this,
      `${id}-${params.zonename}-Certificate`,
      params.publicCertRef
    );

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      'order-origin-access-identity',
      {
        comment: 'Order-OriginAccessIdentity',
      }
    );
    frontendBucket.grantRead(originAccessIdentity);

    const cfDistribution = new Distribution(this, `${id}-cloudfront`, {
      domainNames: [`${params.hostname}.${params.zonename}`],
      defaultBehavior: {
        origin: new S3Origin(frontendBucket, {
          originAccessIdentity: originAccessIdentity,
        }),
      },
      defaultRootObject: 'index.html',
      certificate: certificate,
    });

    const route53Target = RecordTarget.fromAlias(
      new CloudFrontTarget(cfDistribution)
    );

    const orderHostedZone = HostedZone.fromHostedZoneAttributes(
      this,
      'OrderInfra-HostedZone',
      {
        hostedZoneId: params.hostedZoneId,
        zoneName: params.zonename,
      }
    );

    new ARecord(this, `OrderARecord-${params.hostname}`, {
      target: route53Target,
      zone: orderHostedZone,
      recordName: params.hostname,
    });

    const codeTable = new dynamodb.Table(this, codeTableName, {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
      partitionKey: { name: 'code', type: dynamodb.AttributeType.STRING },
    });

    const orderTable = new dynamodb.Table(this, orderTableName, {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'service_id', type: dynamodb.AttributeType.STRING },
    });

    const tokenTable = new dynamodb.Table(this, tokenTableName, {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'id_token', type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: 'expires_at',
    });

    const walletTable = new dynamodb.Table(this, walletTableName, {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'wallet_id', type: dynamodb.AttributeType.STRING },
    });

    const authorizer: any = undefined; //TODO:

    // Create api gw helper
    const apiGw = new ApiGatewayHelper({
      scope: this,
      id: 'order-rest-api',
      description: `Order API - ${envName}`,
      envName,
      authorizer,
    });

    const resourceId = apiGw.getRootResource();

    // Output values
    new CfnOutput(this, `order-assets-bucket-name-${envName}`, {
      value: s3bucket.bucketName,
      exportName: `${s3BucketName}-Bucket-Name`,
    });

    new CfnOutput(this, `order-assets-bucket-arn-${envName}`, {
      value: s3bucket.bucketArn,
      exportName: `${s3BucketName}-Bucket-Arn`,
    });

    new CfnOutput(this, `code-table-name-${envName}`, {
      value: codeTable.tableName,
      exportName: `${codeTableName}-Name`,
    });

    new CfnOutput(this, `code-table-arn-${envName}`, {
      value: codeTable.tableArn,
      exportName: `${codeTableName}-Arn`,
    });

    new CfnOutput(this, `order-table-name-${envName}`, {
      value: orderTable.tableName,
      exportName: `${orderTableName}-Name`,
    });

    new CfnOutput(this, `order-table-arn-${envName}`, {
      value: orderTable.tableArn,
      exportName: `${orderTableName}-Arn`,
    });

    new CfnOutput(this, `token-table-name-${envName}`, {
      value: tokenTable.tableName,
      exportName: `${tokenTableName}-Name`,
    });

    new CfnOutput(this, `token-table-arn-${envName}`, {
      value: tokenTable.tableArn,
      exportName: `${tokenTableName}-Arn`,
    });

    new CfnOutput(this, `wallet-table-name-${envName}`, {
      value: walletTable.tableName,
      exportName: `${walletTableName}-Name`,
    });

    new CfnOutput(this, `wallet-table-arn-${envName}`, {
      value: walletTable.tableArn,
      exportName: `${walletTableName}-Arn`,
    });

    new CfnOutput(this, `order-rest-api-id-${envName}`, {
      exportName: 'OrderRestApiId-' + envName,
      value: apiGw.getApi().restApiId,
    });

    new CfnOutput(this, `order-rest-api-root-resource-${envName}`, {
      exportName: 'OrderRestApiRootResource-' + envName,
      value: resourceId,
    });

    new CfnOutput(this, `order-rest-api-url-${envName}`, {
      value:
        'https://' +
        apiGw.getApi().restApiId +
        '.execute-api.' +
        Stack.of(this).region +
        '.amazonaws.com/' +
        envName,
      exportName: `OrderRestApiUrl-${envName}`,
    });
  }
}

export interface EnvParams {
  hostedZoneId: string;
  zonename: string;
  hostname: string;
  publicCertRef: string;
}
