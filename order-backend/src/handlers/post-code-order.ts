import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  methodNotSupportedResponse,
  resourceNotFoundResponse,
  serverErrorResponse,
  successResponse,
  unAuthorizedResponse,
} from './responses';
import { updateUserIdInTable } from '../aws-wrappers/update-item-in-table';
import { scanCodeTable } from '../aws-wrappers/scan-table';
import logger from '../services/log-service';
import { getUserIdFromAuthHeader } from './utils';
import { handlePayment } from '../services/wallet-service';
import { findOrders, saveOrder } from '../services/order-service';

export const postCodeOrder = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;

    if (method !== 'POST') {
      return methodNotSupportedResponse(method);
    }

    const userId = getUserIdFromAuthHeader(event.headers);
    if (!userId) {
      return unAuthorizedResponse();
    }

    const body = JSON.parse(event.body!);

    const code = await getCodeFromTable(userId, body.serviceId);
    if (!code) {
      return resourceNotFoundResponse('No unused codes left');
    }

    return successResponse({ code });
  } catch (error) {
    logger.error('Error', error);
    return serverErrorResponse(error as Error, 'Failed to get code:');
  }
};

async function getCodeFromTable(userId: string, serviceId: string) {
  const tableName = process.env.CODE_TABLE_NAME as string;
  const codes = await scanCodeTable(tableName);

  const entryWithUserId = codes.find((i) => i.user_id === userId);
  if (entryWithUserId) {
    return entryWithUserId.code;
  }

  const firstEntryWithoutUserId = codes.find((i) => !i.user_id);
  if (firstEntryWithoutUserId) {
    const orders = await findOrders(userId);
    const alreadyOrdered = orders.some((i) => i.serviceId === serviceId);

    if (alreadyOrdered) {
      throw new Error('Service already ordered');
    }

    // TODO: Change balance if needed
    const paymentResponse = await handlePayment(serviceId, userId, 1);

    if (!paymentResponse) {
      throw new Error('Payment not confirmed');
    }
    const { kelaWalletId, paymentRequestId } = paymentResponse;

    await saveOrder(userId, serviceId, kelaWalletId, paymentRequestId);

    await updateUserIdInTable(
      tableName,
      firstEntryWithoutUserId.code!,
      userId,
      paymentRequestId
    );
    return firstEntryWithoutUserId.code;
  }

  return null;
}
