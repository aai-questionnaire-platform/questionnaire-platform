import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  methodNotSupportedResponse,
  resourceNotFoundResponse,
  serverErrorResponse,
  successResponse,
  unAuthorizedResponse,
} from './responses';
import logger from '../services/log-service';
import { getUserIdFromAuthHeader } from './utils';
import { scanWalletTable } from '../aws-wrappers/scan-table';
import { updateWalletTableItem } from '../aws-wrappers/update-item-in-table';

export const getWallet = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'GET') {
      return methodNotSupportedResponse(method);
    }

    const userId = getUserIdFromAuthHeader(event.headers);
    if (!userId) {
      return unAuthorizedResponse();
    }

    const walletId = await getWalletFromTable(userId);
    if (!walletId) {
      return resourceNotFoundResponse('No wallets left');
    }

    return successResponse();
  } catch (error) {
    logger.error('Error', error);
    return serverErrorResponse(error as Error, 'Failed to get wallet:');
  }
};

async function getWalletFromTable(userId: string) {
  logger.info(`Trying to find KELA wallet for user id ${userId}`);
  const tableName = process.env.WALLET_TABLE_NAME as string;
  const wallets = await scanWalletTable(tableName);

  const entryWithUserId = wallets.find((i) => i.user_id === userId);
  if (entryWithUserId) {
    logger.info(`Found wallet for ${userId}: ${entryWithUserId.wallet_id}`);
    return entryWithUserId.wallet_id;
  }

  const firstEntryWithoutUserId = wallets.find((i) => !i.user_id);
  if (firstEntryWithoutUserId) {
    logger.info(
      `Didn't find assigned wallet, assigning KELA wallet ${firstEntryWithoutUserId.wallet_id} for ${userId}`
    );
    await updateWalletTableItem(
      tableName,
      firstEntryWithoutUserId.wallet_id!,
      userId
    );
    return firstEntryWithoutUserId.wallet_id;
  }
  logger.info(`No wallet found for user ${userId}`);
  return null;
}
