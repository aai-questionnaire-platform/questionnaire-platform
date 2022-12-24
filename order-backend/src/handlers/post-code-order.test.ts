import * as scanWrapper from '../aws-wrappers/scan-table';
import * as updateWrapper from '../aws-wrappers/update-item-in-table';
import * as orderService from '../services/order-service';
import * as walletService from '../services/wallet-service';
import { postCodeOrder } from './post-code-order';
import * as utils from './utils';

jest.mock('../services/log-service');
jest.mock('../aws-wrappers/update-item-in-table');
jest.mock('../aws-wrappers/scan-table');
jest.mock('../services/order-service');
jest.mock('../services/wallet-service');

describe('POST code', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return 400 if httpmethod is not post', async () => {
    const event = { httpMethod: 'GET' };
    const response = await postCodeOrder(event as any);
    expect(response).toEqual({
      statusCode: 400,
      headers: expect.any(Object),
      body: JSON.stringify({
        statusCode: 400,
        message: 'GET is not supported',
      }),
    });
  });

  it('should return error if user is not authenticated', async () => {
    const event = { httpMethod: 'POST' };
    const response = await postCodeOrder(event as any);

    expect(response).toEqual({
      statusCode: 401,
      headers: expect.any(Object),
      body: JSON.stringify({
        statusCode: 401,
        message: 'Unauthorized',
      }),
    });
  });

  it('should return error if no unused codes left', async () => {
    jest
      .spyOn(scanWrapper, 'scanCodeTable')
      .mockResolvedValueOnce([{ code: '12345', user_id: 'userId1' }]);

    jest.spyOn(utils, 'getUserIdFromAuthHeader').mockReturnValueOnce('123');

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ serviceId: '1' }),
    };
    const response = await postCodeOrder(event as any);

    expect(scanWrapper.scanCodeTable).toHaveBeenCalledTimes(1);
    expect(updateWrapper.updateUserIdInTable).toHaveBeenCalledTimes(0);

    expect(response).toEqual({
      statusCode: 404,
      headers: expect.any(Object),
      body: JSON.stringify({
        statusCode: 404,
        message: 'No unused codes left',
      }),
    });
  });

  it('should return code for given user ID', async () => {
    jest.spyOn(scanWrapper, 'scanCodeTable').mockResolvedValueOnce([
      { code: '12345', user_id: 'userId1' },
      { code: '23456', user_id: 'userId2' },
      { code: '34567', user_id: undefined },
    ]);

    jest.spyOn(utils, 'getUserIdFromAuthHeader').mockReturnValueOnce('userId1');

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ serviceId: '1' }),
    };
    const response = await postCodeOrder(event as any);

    expect(scanWrapper.scanCodeTable).toHaveBeenCalledTimes(1);
    expect(updateWrapper.updateUserIdInTable).toHaveBeenCalledTimes(0);

    expect(response).toEqual({
      statusCode: 200,
      headers: expect.any(Object),
      body: JSON.stringify({ code: '12345' }),
    });
  });

  it('should return first unused code if no code has been assigned to user', async () => {
    jest.spyOn(scanWrapper, 'scanCodeTable').mockResolvedValueOnce([
      { code: '12345', user_id: 'userId1' },
      { code: '23456', user_id: undefined },
      { code: '34567', user_id: undefined },
    ]);
    jest.spyOn(walletService, 'handlePayment').mockResolvedValueOnce({
      kelaWalletId: 'kelaWalletId',
      paymentRequestId: 'paymentRequestId',
    });
    jest.spyOn(orderService, 'saveOrder').mockResolvedValueOnce({
      userId: '123',
      serviceId: '1',
      orderId: '12345',
    });
    jest.spyOn(orderService, 'findOrders').mockResolvedValueOnce([]);
    jest.spyOn(utils, 'getUserIdFromAuthHeader').mockReturnValueOnce('123');

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ serviceId: '1' }),
    };
    const response = await postCodeOrder(event as any);

    expect(scanWrapper.scanCodeTable).toHaveBeenCalledTimes(1);
    expect(walletService.handlePayment).toHaveBeenCalledTimes(1);
    expect(orderService.saveOrder).toHaveBeenCalledTimes(1);
    expect(updateWrapper.updateUserIdInTable).toHaveBeenCalledTimes(1);

    expect(response).toEqual({
      statusCode: 200,
      headers: expect.any(Object),
      body: JSON.stringify({ code: '23456' }),
    });
  });
});
