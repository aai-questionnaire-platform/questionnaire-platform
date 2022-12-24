import { GameInstance } from '../datamodels/game-instance';
import { UserService } from '../services/user-service';
import { postUser } from './post-user';
import {
  findFromUserAttributes,
  getGameInstanceFromEnv,
  getUsenameFromAuthHeader,
} from './utils';

jest.mock('../services/user-service');
jest.mock('./utils');

describe('PostUserHandler', () => {
  const mockService = UserService as unknown as jest.Mock<any>;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  beforeEach(() => {
    (
      getUsenameFromAuthHeader as jest.MockedFunction<
        typeof getUsenameFromAuthHeader
      >
    ).mockReturnValue('username');

    (
      getGameInstanceFromEnv as jest.MockedFunction<
        typeof getGameInstanceFromEnv
      >
    ).mockResolvedValue({} as GameInstance);
  });

  it('should return 400 if httpmethod is not post', async () => {
    const event = { httpMethod: 'GET' };
    expect(await postUser(event as any)).toEqual({
      statusCode: 400,
      headers,
      body: JSON.stringify({
        statusCode: 400,
        message: 'GET is not supported',
      }),
    });
  });

  describe('create user', () => {
    const user = {
      email: 'a@a.com',
      name: 'Keke',
      organization_id: '1',
      group_ids: ['1', '2'],
    };
    const event = { httpMethod: 'POST', body: JSON.stringify(user) };

    beforeEach(() => {
      (
        findFromUserAttributes as jest.MockedFunction<
          typeof findFromUserAttributes
        >
      ).mockReturnValue('123');
    });

    it("should call service's create method if there's no userId in query params", async () => {
      const createMock = jest.fn().mockResolvedValueOnce({});
      mockService.mockImplementationOnce(() => ({
        createUser: createMock,
      }));

      await postUser(event as any);

      expect(createMock).toHaveBeenCalledWith(
        user.email,
        user.name,
        user.organization_id,
        user.group_ids
      );
    });

    it('should return 200 ok with user with id in response', async () => {
      const createMock = jest.fn().mockResolvedValueOnce({});
      mockService.mockImplementationOnce(() => ({
        createUser: createMock,
      }));

      const response = await postUser(event as any);

      expect(response).toEqual({
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          user: {
            ...user,
            id: '123',
          },
        }),
      });
    });

    it('should return an error when create fails', async () => {
      const createMock = jest.fn().mockRejectedValueOnce(new Error('FAILED'));
      mockService.mockImplementationOnce(() => ({
        createUser: createMock,
      }));

      const response = await postUser(event as any);

      expect(response).toEqual({
        statusCode: 500,
        headers,
        body: JSON.stringify({ statusCode: 500, message: 'FAILED' }),
      });
    });
  });

  describe('edit user', () => {
    const user = {
      id: '123',
      email: 'a@a.com',
      name: 'Keke',
      organization_id: '1',
      group_ids: ['1', '2'],
    };

    const event = {
      httpMethod: 'POST',
      queryStringParameters: { userId: user.id },
      body: JSON.stringify(user),
    };

    it("should call service's edit method if there's an userId in query params", async () => {
      const editMock = jest.fn().mockResolvedValueOnce(undefined);
      mockService.mockImplementationOnce(() => ({
        updateUser: editMock,
      }));

      await postUser(event as any);

      expect(editMock).toHaveBeenCalledWith({
        username: user.email,
        name: user.name,
        organizationIds: user.organization_id,
        groupIds: '1, 2',
      });
    });

    it('should return 200 ok with user with id in response', async () => {
      const editMock = jest.fn().mockResolvedValueOnce(undefined);
      mockService.mockImplementationOnce(() => ({
        updateUser: editMock,
      }));

      const response = await postUser(event as any);

      expect(response).toEqual({
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          user,
        }),
      });
    });

    it('should return an error when update fails', async () => {
      const editMock = jest.fn().mockRejectedValueOnce(new Error('FAILED'));
      mockService.mockImplementationOnce(() => ({
        updateUser: editMock,
      }));

      const response = await postUser(event as any);

      expect(response).toEqual({
        statusCode: 500,
        headers,
        body: JSON.stringify({ statusCode: 500, message: 'FAILED' }),
      });
    });
  });
});
