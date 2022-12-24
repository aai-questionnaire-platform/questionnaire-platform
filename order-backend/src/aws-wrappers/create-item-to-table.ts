import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { Order } from '../types';

export async function putOrderToTable(
  tableName: string,
  userId: string,
  serviceId: string,
  kelaWalletId: string,
  paymentRequestId: string,
  orderId: string,
  timestamp: string
): Promise<Order> {
  const putCommand = new PutItemCommand({
    TableName: tableName,
    Item: {
      order_id: { S: orderId },
      user_id: { S: userId },
      service_id: { S: serviceId },
      kela_wallet_id: { S: kelaWalletId },
      payment_request_id: { S: paymentRequestId },
      updated_at: { N: timestamp },
    },
  });

  await new DynamoDBClient({ region: 'eu-west-1' }).send(putCommand);

  return {
    userId,
    serviceId,
    orderId,
  };
}
