import { postOrder } from './post-order';
import * as utils from './utils';
import * as orderService from '../services/order-service';
import * as walletService from '../services/wallet-service';
import * as emailService from './email/sendEmail';

jest.mock('../services/order-service');
jest.mock('./email/sendEmail');
jest.mock('../services/log-service');

describe('POST order', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return 400 if httpmethod is not POST', async () => {
    const event = { httpMethod: 'GET' };
    const response = await postOrder(event as any);

    expect(response).toEqual({
      statusCode: 400,
      headers: expect.any(Object),
      body: JSON.stringify({
        statusCode: 400,
        message: 'GET is not supported',
      }),
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    const event = { httpMethod: 'POST', headers: {}, body: '{}' };

    expect(await postOrder(event as any)).toEqual({
      statusCode: 401,
      headers: expect.any(Object),
      body: JSON.stringify({
        statusCode: 401,
        message: 'Unauthorized',
      }),
    });
  });

  it('should return 200 ok', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ serviceId: '1' }),
    };
    const order: any = { orderId: '123456' };

    jest.spyOn(utils, 'getUserIdFromAuthHeader').mockReturnValueOnce('123');
    jest.spyOn(walletService, 'handlePayment').mockResolvedValueOnce({
      kelaWalletId: 'kelaWalletId',
      paymentRequestId: 'paymentRequestId',
    });
    jest.spyOn(orderService, 'findOrders').mockResolvedValueOnce([]);
    jest.spyOn(orderService, 'saveOrder').mockReturnValueOnce(order);

    expect(await postOrder(event as any)).toEqual({
      statusCode: 200,
      headers: expect.any(Object),
      body: JSON.stringify(order),
    });

    expect(orderService.saveOrder).toHaveBeenCalledWith(
      '123',
      '1',
      'kelaWalletId',
      'paymentRequestId'
    );
  });

  it('should send email on success', async () => {
    const order: any = { serviceId: '1', contactDetails: {} };
    const event = { httpMethod: 'POST', body: JSON.stringify(order) };

    jest.spyOn(utils, 'getUserIdFromAuthHeader').mockReturnValueOnce('123');
    jest.spyOn(walletService, 'handlePayment').mockResolvedValueOnce({
      kelaWalletId: 'kelaWalletId',
      paymentRequestId: 'paymentRequestId',
    });
    jest.spyOn(orderService, 'findOrders').mockResolvedValueOnce([]);
    jest.spyOn(orderService, 'saveOrder').mockReturnValueOnce(order);

    await postOrder(event as any);

    expect(emailService.sendEmail).toHaveBeenCalledWith({
      serviceId: order.serviceId,
      contactDetails: order.contactDetails,
    });
  });

  it('should return 500 if order save fails', async () => {
    const event = { httpMethod: 'POST', body: '{}' };

    jest.spyOn(utils, 'getUserIdFromAuthHeader').mockReturnValueOnce('123');
    jest.spyOn(walletService, 'handlePayment').mockResolvedValueOnce({
      kelaWalletId: 'kelaWalletId',
      paymentRequestId: 'paymentRequestId',
    });
    jest.spyOn(orderService, 'findOrders').mockResolvedValueOnce([]);
    jest
      .spyOn(orderService, 'saveOrder')
      .mockRejectedValueOnce(new Error('Error!'));

    expect(await postOrder(event as any)).toEqual({
      statusCode: 500,
      headers: expect.any(Object),
      body: JSON.stringify({
        statusCode: 500,
        message: 'Failed to submit order: Error!',
      }),
    });

    expect(emailService.sendEmail).not.toHaveBeenCalled();
  });

  it('should return 500 if sending email fails', async () => {
    const event = { httpMethod: 'POST', body: '{}' };
    const order: any = { orderId: '123456' };

    jest.spyOn(utils, 'getUserIdFromAuthHeader').mockReturnValueOnce('123');
    jest.spyOn(walletService, 'handlePayment').mockResolvedValueOnce({
      kelaWalletId: 'kelaWalletId',
      paymentRequestId: 'paymentRequestId',
    });
    jest.spyOn(orderService, 'findOrders').mockResolvedValueOnce([]);
    jest.spyOn(orderService, 'saveOrder').mockReturnValueOnce(order);
    jest
      .spyOn(emailService, 'sendEmail')
      .mockRejectedValueOnce(new Error('Error!'));

    expect(await postOrder(event as any)).toEqual({
      statusCode: 500,
      headers: expect.any(Object),
      body: JSON.stringify({
        statusCode: 500,
        message: 'Failed to submit order: Error!',
      }),
    });
  });
});
