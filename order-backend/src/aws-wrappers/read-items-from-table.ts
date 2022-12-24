import {
  AttributeValue,
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import * as logger from '../services/log-service';

function parseOrder(item: { [key: string]: AttributeValue }) {
  return {
    userId: item.user_id.S!,
    serviceId: item.service_id.S!,
    orderId: item.order_id.S!,
  };
}

export async function readOrdersFromTableByUserId(
  tableName: string,
  userId: string
) {
  try {
    const params = {
      TableName: tableName,
      KeyConditionExpression: `user_id=:k`,
      ExpressionAttributeValues: {
        ':k': { S: userId },
      },
    };

    const items = await listItems(params);
    return items?.map(parseOrder) || [];
  } catch (err) {
    logger.error('readOrdersFromTableByUserId():', err, tableName);
    throw err;
  }
}

function runQuery(params: QueryCommandInput) {
  const client = new DynamoDBClient({});
  const command = new QueryCommand(params);
  return client.send(command);
}

export async function listItems(params: QueryCommandInput) {
  const results = await runQuery(params);
  return results.Items;
}
