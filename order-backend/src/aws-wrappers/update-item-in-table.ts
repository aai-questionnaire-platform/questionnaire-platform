import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

export async function updateUserIdInTable(
  tableName: string,
  code: string,
  user_id: string,
  payment_request_id: string
) {
  const command = new UpdateItemCommand({
    TableName: tableName,
    Key: {
      code: { S: code },
    },
    UpdateExpression:
      'SET user_id = :user_id, payment_request_id = :payment_request_id',
    ExpressionAttributeValues: {
      ':user_id': { S: user_id },
      ':payment_request_id': { S: payment_request_id },
    },
  });

  const client = new DynamoDBClient({});
  return client.send(command);
}

export async function updateWalletTableItem(
  tableName: string,
  wallet_id: string,
  user_id: string
) {
  const command = new UpdateItemCommand({
    TableName: tableName,
    Key: {
      wallet_id: { S: wallet_id },
    },
    UpdateExpression: 'SET user_id = :user_id',
    ExpressionAttributeValues: {
      ':user_id': { S: user_id },
    },
  });

  const client = new DynamoDBClient({});
  return client.send(command);
}
