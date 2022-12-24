import { CreateEmailIdentityCommand, SESv2Client } from "@aws-sdk/client-sesv2";

export class SesHelper {
  async createVerifiedDomainIdentity(zoneName: string) {
    const client = new SESv2Client({ region: "eu-west-1" });
    const command = new CreateEmailIdentityCommand({
      EmailIdentity: zoneName,
    });

    try {
      await client.send(command);
    } catch (e) {
      console.error(
        "createVerifiedDomainIdentity(): Error while creating a verified domain " +
          zoneName
      );
    }
  }
}
