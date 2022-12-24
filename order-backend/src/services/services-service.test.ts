import { getServices } from './services-service';
import servicesList from './get-services-response';
import * as orderService from './order-service';

jest.mock('./order-service');
jest.mock('./log-service');

describe('getServices', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return a list of services', async () => {
    jest.spyOn(orderService, 'findOrders').mockResolvedValueOnce([]);
    expect((await getServices('1')).length).toEqual(servicesList.length);
    expect(orderService.findOrders).toHaveBeenCalledWith('1');
  });

  it('should return services with availability', async () => {
    jest.spyOn(orderService, 'findOrders').mockResolvedValueOnce([]);
    const result = await getServices('1');
    expect(result[0].available).toBe(true);
  });

  it('should return services with negative availability if order is found from the orders table', async () => {
    jest.spyOn(orderService, 'findOrders').mockResolvedValueOnce([
      {
        orderId: '1',
        serviceId: '1',
        userId: 'userId',
      },
    ]);
    const result = await getServices('1');
    expect(result[0].available).toBe(false);
  });

  it('should throw if order fetch fails', async () => {
    jest
      .spyOn(orderService, 'findOrders')
      .mockRejectedValueOnce(new Error('Error!'));

    await expect(getServices('1')).rejects.toThrow('Error!');
  });
});
