import { findOrders, saveOrder } from './order-service';
import * as readWrapper from '../aws-wrappers/read-items-from-table';
import * as createWrapper from '../aws-wrappers/create-item-to-table';
import { Order } from '../types';

jest.mock('../aws-wrappers/scan-table');
jest.mock('./log-service');

describe('findOrders', () => {
  it('should return an empty list', async () => {
    jest
      .spyOn(readWrapper, 'readOrdersFromTableByUserId')
      .mockResolvedValueOnce([]);
    expect(await findOrders('1')).toEqual([]);
  });

  it('should return orders from the table', async () => {
    const orders: Order[] = [
      {
        orderId: '1',
        serviceId: '2',
        userId: 'userId',
      },
    ];
    jest
      .spyOn(readWrapper, 'readOrdersFromTableByUserId')
      .mockResolvedValueOnce(orders);

    const result = await findOrders('1');
    expect(result).toBe(orders);
    expect(readWrapper.readOrdersFromTableByUserId).toHaveBeenCalledWith(
      undefined,
      '1'
    );
  });

  it('should throw when scan fails', async () => {
    jest
      .spyOn(readWrapper, 'readOrdersFromTableByUserId')
      .mockRejectedValueOnce(new Error('Error!'));

    await expect(findOrders('1')).rejects.toThrow('Error!');
  });
});

describe('saveOrder', () => {
  const order = {
    orderId: 'orderId',
    serviceId: 'serviceId',
    contactDetails: {},
  };
  const kelaWalletId = 'kelaWalletId';
  const paymentRequestId = 'paymentRequestId';

  it('should put order to table', async () => {
    jest
      .spyOn(createWrapper, 'putOrderToTable')
      .mockResolvedValueOnce({} as any);
    await saveOrder('userId', order.serviceId, kelaWalletId, paymentRequestId);

    expect(createWrapper.putOrderToTable).toHaveBeenCalledWith(
      undefined,
      'userId',
      'serviceId',
      'kelaWalletId',
      'paymentRequestId',
      expect.any(String),
      expect.any(String)
    );
  });

  it('should throw if db action fails', async () => {
    jest
      .spyOn(createWrapper, 'putOrderToTable')
      .mockRejectedValueOnce(new Error('Error!'));

    await expect(
      saveOrder('userId', order.serviceId, kelaWalletId, paymentRequestId)
    ).rejects.toThrow('Error!');
  });
});
