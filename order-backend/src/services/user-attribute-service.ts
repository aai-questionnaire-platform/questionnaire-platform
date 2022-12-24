import { RestConnector } from '../api/rest/rest-connector';

export class UserAttributeService {
  constructor() {}

  async readUserAttribute(accessToken: string) {
    const aaiCoreServicesUrl = <string>process.env.AAI_LOGIN_URL;
    const restConnector = new RestConnector(aaiCoreServicesUrl, accessToken);
    console.debug('Fetching user attributes');
    try {
      const response = await restConnector.getJSON(
        'profile-management/v1/user_attributes/all_authorized'
      );
      console.log('user attributes-response', response);
      return response;
    } catch (e) {
      console.error('Error fetching user attribute', e);
      return 'ERROR';
    }
  }

  static isUserAttributeValid(hnUserAttribute: any) {
    return (
      typeof hnUserAttribute === 'object' &&
      hnUserAttribute.tampere_demo_flag.value
    );
  }
}
