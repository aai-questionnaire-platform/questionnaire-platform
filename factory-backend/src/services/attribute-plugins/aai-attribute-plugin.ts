/*
  Defines members and functions implemented by all attribute generator plugins
 */
import {DynamoDBRecord} from "aws-lambda";

export abstract class AaiAttributePlugin {
  abstract generateAttribute(attribute: string, record: DynamoDBRecord): any;
}

