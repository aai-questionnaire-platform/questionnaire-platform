//vpc-stack.ts
import * as cdk from "@aws-cdk/core";
import cloudfront = require("@aws-cdk/aws-cloudfront");
import s3 = require("@aws-cdk/aws-s3");
import route53 = require("@aws-cdk/aws-route53");
import targets = require("@aws-cdk/aws-route53-targets");

export class FrontendHelper extends cdk.Construct {
  _distribution: cloudfront.CloudFrontWebDistribution;
  _loginUrl: string;

  constructor(scope: cdk.Construct, id: string, envName: string) {
    super(scope, id);

    const prodParams: EnvParams = {
      aRecordName: "admin",
      zoneName: "yourdomain.fi",
      fqdnList: [ "admin.yourdomain.fi" ],
      hostedZoneId: "EXAMPLE-ROUTE53ZONEID",
      publicCertRef: "arn:aws:acm:us-east-1:<accountid>:certificate/<certid>"
    };

    const devParams: EnvParams = {
      aRecordName: "admin-" + envName,
      zoneName: "yourdomain.fi",
      fqdnList: [ "admin-" + envName + ".yourdomain.fi" ],
      hostedZoneId: "EXAMPLE-ROUTE53ZONEID",
      publicCertRef: "arn:aws:acm:us-east-1:<accountid>:certificate/<certid>"
    };

    const params: EnvParams = envName === "prod" ? prodParams: devParams;

    const adminBucket = new s3.Bucket(this, "QuestionnaireAdmin-" + envName, {
      bucketName: "questionnaire-admin-" + envName,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    this._distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "QuestionnaireAdminFrontendDistribution",
      {
        aliasConfiguration: {
          acmCertRef: params.publicCertRef,
          names: params.fqdnList,
        },
        originConfigs: [
          {
            customOriginSource: {
              domainName: adminBucket.bucketWebsiteDomainName,
              originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      }
    );

    const mmkHostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "AdminImportedHostedZone",
      {
        hostedZoneId: params.hostedZoneId,
        zoneName: params.zoneName
      }
    );

    const aliasRecord = new route53.ARecord(this, "AdminAliasRecord", {
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(this._distribution)
      ),
      zone: mmkHostedZone,
      recordName: params.aRecordName,
    });

    this._loginUrl = params.fqdnList[0] + "/login";
  }

  getDistribution() {
    return this._distribution;
  }

  getLoginUrl() {
    return this._loginUrl;
  }
}

interface EnvParams {
  aRecordName: string;
  hostedZoneId: string;
  fqdnList: string[];
  zoneName: string;
  publicCertRef: string;
}

