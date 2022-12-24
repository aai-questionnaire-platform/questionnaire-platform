import { UserAttributeService } from './user-attribute-service';
import { RestConnector } from '../api/rest/rest-connector';

jest.mock('../api/rest/rest-connector');

describe('UserAttributeService', () => {
  const mockRestConnector = RestConnector as jest.MockedClass<
    typeof RestConnector
  >;

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('Test if user attribute is valid', () => {
    it('User attribute is valid', async () => {
      expect(
        UserAttributeService.isUserAttributeValid({
          flag: { status: 'SUCCESS', value: true },
        })
      );
    });
  });
});
