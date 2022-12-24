import { GameInstance } from '../datamodels/game-instance';
import { UserService } from './user-service';

describe('UserService', () => {
  const adminCreateUserMock = jest.fn((_params: any, callback: any) => {
    callback(null, {});
  });

  const adminUpdateUserAttributesMock = jest.fn(
    (_params: any, callback: any) => {
      callback(null, {});
    }
  );

  jest
    .spyOn(UserService.prototype as any, 'createCognitoClient')
    .mockImplementation(
      jest.fn().mockReturnValue({
        adminCreateUser: adminCreateUserMock,
        adminUpdateUserAttributes: adminUpdateUserAttributesMock,
        listUsers: (params: any, callback: any) => {
          callback(null, {
            Users: [
              {
                Username: 'testiuser1',
                Attributes: [
                  {
                    Name: 'name',
                    Value: 'Test I. User',
                  },
                  {
                    Name: 'custom:organization_ids',
                    Value: '1',
                  },
                  {
                    Name: 'custom:group_ids',
                    Value: 'a',
                  },
                ],
                UserCreateDate: '2021-12-01T10:57:46.214Z',
                UserLastModifiedDate: '2021-12-01T13:57:24.736Z',
                Enabled: true,
                UserStatus: 'FORCE_CHANGE_PASSWORD',
              },
              {
                Username: 'testiuser2',
                Attributes: [
                  {
                    Name: 'custom:organization_ids',
                    Value: '2',
                  },
                  {
                    Name: 'custom:group_ids',
                    Value: 'b',
                  },
                ],
                UserCreateDate: '2021-12-01T10:58:01.849Z',
                UserLastModifiedDate: '2021-12-02T14:31:30.147Z',
                Enabled: true,
                UserStatus: 'FORCE_CHANGE_PASSWORD',
              },
              {
                Username: 'testiuser3',
                Attributes: [
                  {
                    Name: 'custom:organization_ids',
                    Value: '3',
                  },
                  {
                    Name: 'custom:group_ids',
                    Value: 'c',
                  },
                ],
                UserCreateDate: '2021-12-01T13:36:08.274Z',
                UserLastModifiedDate: '2021-12-01T13:36:08.274Z',
                Enabled: true,
                UserStatus: 'FORCE_CHANGE_PASSWORD',
              },
              {
                Username: 'testiuser4',
                Attributes: [
                  {
                    Name: 'custom:organization_ids',
                    Value: '4,1',
                  },
                  {
                    Name: 'custom:group_ids',
                    Value: 'd,a',
                  },
                ],
                UserCreateDate: '2021-12-01T14:02:47.073Z',
                UserLastModifiedDate: '2021-12-01T14:02:47.073Z',
                Enabled: true,
                UserStatus: 'FORCE_CHANGE_PASSWORD',
              },
            ],
          });
        },
      })
    );

  const gameInstance: GameInstance = {
    gameUuid: 'game-1',
    gameApiToken: 'token',
    gameApiEndpoint: 'endpoint',
    gameAdminUserPoolId: 'userpoolid',
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('listUsers', () => {
    const service = new UserService('', '', '', gameInstance, '');

    it('read users by organizationId', async () => {
      const users: any = await service.readUsersByOrganization('1');
      expect(users.length).toBe(2);
    });

    it('read users by groupId', async () => {
      const users: any = await service.readUsersByGroup('a');
      expect(users.length).toBe(2);
    });

    it('read user who belongs to several organizations', async () => {
      const users: any = await service.readUsersByOrganization('4');
      expect(users.length).toBe(1);
    });

    it('read user who belongs to several groups', async () => {
      const users: any = await service.readUsersByGroup('d');
      expect(users.length).toBe(1);
    });

    it('create user with organization', async () => {
      await service.createUser('user123', 'hessu', '222', ['333']);
      expect(adminCreateUserMock).toBeCalledTimes(1);
    });

    it('should map cognito users to users', async () => {
      const users: any = await service.readUsersByGroup('a');
      expect(users[0]).toEqual({
        email: 'testiuser1',
        group_ids: ['a'],
        name: 'Test I. User',
      });
    });
  });

  describe('updateUser', () => {
    const service = new UserService('', '', '', gameInstance, '');

    it("should update user's organization", async () => {
      await service.updateUser({
        username: 'testi@testi.com',
        organizationIds: '1',
      });
      expect(adminUpdateUserAttributesMock).toHaveBeenCalledWith(
        {
          UserPoolId: 'userpoolid',
          Username: 'testi@testi.com',
          UserAttributes: [
            {
              Name: 'custom:organization_ids',
              Value: '1',
            },
          ],
        },
        expect.any(Function)
      );
    });

    it("should update user's organizations with an empty string", async () => {
      await service.updateUser({
        username: 'testi@testi.com',
        organizationIds: '',
      });
      expect(adminUpdateUserAttributesMock).toHaveBeenCalledWith(
        {
          UserPoolId: 'userpoolid',
          Username: 'testi@testi.com',
          UserAttributes: [
            {
              Name: 'custom:organization_ids',
              Value: '',
            },
          ],
        },
        expect.any(Function)
      );
    });

    it("should update user's groups", async () => {
      await service.updateUser({
        username: 'testi@testi.com',
        organizationIds: undefined,
        groupIds: '2',
      });
      expect(adminUpdateUserAttributesMock).toHaveBeenCalledWith(
        {
          UserPoolId: 'userpoolid',
          Username: 'testi@testi.com',
          UserAttributes: [
            {
              Name: 'custom:group_ids',
              Value: '2',
            },
          ],
        },
        expect.any(Function)
      );
    });

    it("should update user's groups with an empty string", async () => {
      await service.updateUser({
        username: 'testi@testi.com',
        organizationIds: undefined,
        groupIds: '',
      });
      expect(adminUpdateUserAttributesMock).toHaveBeenCalledWith(
        {
          UserPoolId: 'userpoolid',
          Username: 'testi@testi.com',
          UserAttributes: [
            {
              Name: 'custom:group_ids',
              Value: '',
            },
          ],
        },
        expect.any(Function)
      );
    });

    it('should update both the organizations and the groups', async () => {
      await service.updateUser({
        username: 'testi@testi.com',
        organizationIds: '1',
        groupIds: '2',
      });
      expect(adminUpdateUserAttributesMock).toHaveBeenCalledWith(
        {
          UserPoolId: 'userpoolid',
          Username: 'testi@testi.com',
          UserAttributes: [
            {
              Name: 'custom:organization_ids',
              Value: '1',
            },
            {
              Name: 'custom:group_ids',
              Value: '2',
            },
          ],
        },
        expect.any(Function)
      );
    });

    it('should reject in case the call to cognito client fails', async () => {
      adminUpdateUserAttributesMock.mockImplementationOnce(
        (_params: any, callback: any) => {
          callback(new Error('FAILED'), {});
        }
      );
      await expect(
        service.updateUser({
          username: 'testi@testi.com',
          organizationIds: '1',
        })
      ).rejects.toThrow('FAILED');
    });
  });

  describe('removeUserFromGroup', () => {
    const service = new UserService('', '', '', gameInstance, '');

    it('should remove user from a group', async () => {
      jest.spyOn(service, 'updateUser');
      await service.removeUserFromGroup('testi@testi.com', '1', ['1']);
      expect(service.updateUser).toHaveBeenCalledWith({
        username: 'testi@testi.com',
        organizationIds: undefined,
        groupIds: '',
      });
    });

    it('should preserve existing groups', async () => {
      jest.spyOn(service, 'updateUser');
      await service.removeUserFromGroup('testi@testi.com', '1', ['1', '2']);
      expect(service.updateUser).toHaveBeenCalledWith({
        username: 'testi@testi.com',
        organizationIds: undefined,
        groupIds: '2',
      });
    });

    it('should not call update if groupIds list is empty or not defined', async () => {
      jest.spyOn(service, 'updateUser');
      await service.removeUserFromGroup('testi@testi.com', '1', []);
      expect(service.updateUser).not.toHaveBeenCalled();
    });

    it('should not call update if given groupUuid is an empty string', async () => {
      jest.spyOn(service, 'updateUser');
      await service.removeUserFromGroup('testi@testi.com', '', ['1']);
      expect(service.updateUser).not.toHaveBeenCalled();
    });
  });
});
