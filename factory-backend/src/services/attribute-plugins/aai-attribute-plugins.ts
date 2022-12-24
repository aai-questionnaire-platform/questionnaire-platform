import { AaiAttributePlugin } from './aai-attribute-plugin';
import { DynamoDBRecord } from "aws-lambda";

/*
  Generate example attribute for parenting-youth
 */
export class HoivaavatNuoretAttribute extends AaiAttributePlugin {
  public generateAttribute(attribute: string, record: DynamoDBRecord): any {
    // Here the attribute is generated according to record
    return true;
  }
}
