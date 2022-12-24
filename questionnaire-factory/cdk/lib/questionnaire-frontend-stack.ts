import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import {
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_s3 as s3,
  aws_route53 as route53,
  aws_route53_targets as route53_targets,
  aws_certificatemanager as acm,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { getQuestionnaireMap } from '../../config/FQDNQuestionnaireMap';

export class QuestionnaireFrontendStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    envName: string,
    props: StackProps
  ) {
    super(scope, id, props);

    const params: EnvParams = {
      hostedZoneId: 'EXAMPLE-ROUTE53ZONEID',
      zoneName: 'yourdomain.fi',
      publicCertRef:
        'arn:aws:acm:us-east-1:<accountid>:certificate/<certid>',
    };

    const domainNames = Array.from(getQuestionnaireMap(envName).keys());

    const qfBucket = new s3.Bucket(this, 'nextjsorigin');
    const certificate = acm.Certificate.fromCertificateArn(
      this,
      `${id}-${params.zoneName}-Certificate`,
      params.publicCertRef
    );
    const cfDistribution = new cloudfront.Distribution(
      this,
      `${id}-cloudfront`,
      {
        domainNames: domainNames,
        defaultBehavior: {
          origin: new origins.S3Origin(qfBucket),
        },
        certificate: certificate,
      }
    );

    const route53Target = route53.RecordTarget.fromAlias(
      new route53_targets.CloudFrontTarget(cfDistribution)
    );
    const qfHostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'QFHostedZone',
      {
        hostedZoneId: params.hostedZoneId,
        zoneName: params.zoneName,
      }
    );

    domainNames.forEach((recordName) => {
      const aRecord = new route53.ARecord(this, `QfAlias-${recordName}`, {
        target: route53Target,
        zone: qfHostedZone,
        recordName: recordName,
      });
    });

    new CfnOutput(this, 'cloudFrontDistributionId', {
      value: cfDistribution.distributionId,
      exportName: `cloudFrontDistributionId-${envName}`,
    });

    new CfnOutput(this, 'cloudFrontDistributionEndpoint', {
      value: cfDistribution.domainName,
      exportName: `cloudFrontDistributionEndpoint-${envName}`,
    });

    new CfnOutput(this, 'originBucketId', {
      value: qfBucket.bucketName,
      exportName: `originBucketId-${envName}`,
    });
  }
}

interface EnvParams {
  hostedZoneId: string;
  zoneName: string;
  publicCertRef: string;
}
