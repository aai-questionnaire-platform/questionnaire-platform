import { v4 as uuidv4 } from 'uuid';
import { putOrderToTable } from '../aws-wrappers/create-item-to-table';
import { readOrdersFromTableByUserId } from '../aws-wrappers/read-items-from-table';
import logger from './log-service';

export async function findOrders(userId: string) {
  const orderTableName = process.env.ORDER_TABLE_NAME as string;
  logger.info('Scanning orders table', orderTableName);

  try {
    const orders = await readOrdersFromTableByUserId(orderTableName, userId);
    logger.info('Found', orders.length, 'order(s)');
    return orders;
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

export const saveOrder = async (
  userId: string,
  serviceId: string,
  kelaWalletId: string,
  paymentRequestId: string
) => {
  const tableName = process.env.ORDER_TABLE_NAME as string;

  logger.debug('Saving order to table', process.env.ORDER_TABLE_NAME);
  logger.info('Order service', serviceId, 'for user', userId);

  const record = await putOrderToTable(
    tableName,
    userId,
    serviceId,
    kelaWalletId,
    paymentRequestId,
    uuidv4(),
    String(Date.now())
  );

  logger.info('Order', record.orderId, 'saved successfully');
  return record;
};
