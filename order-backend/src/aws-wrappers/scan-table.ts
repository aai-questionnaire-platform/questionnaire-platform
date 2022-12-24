import { DynamoDB } from '@aws-sdk/client-dynamodb';

export async function scanCodeTable(tableName: string) {
  const items = await scanTable(tableName);

  return (
    items?.map((item) => ({
      code: item.code.S,
      user_id: item.user_id.S,
    })) || []
  );
}

export async function scanWalletTable(tableName: string) {
  const items = await scanTable(tableName);

  return (
    items?.map((item) => ({
      wallet_id: item.wallet_id.S,
      user_id: item.user_id.S,
    })) || []
  );
}

async function scanTable(tableName: string) {
  const params = { TableName: tableName };
  const result = await new DynamoDB({}).scan(params);
  return result.Items;
}
