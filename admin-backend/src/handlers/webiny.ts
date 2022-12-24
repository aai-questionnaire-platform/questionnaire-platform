import { WebinyProxyService } from '../services/webiny-proxy-service';
import { successResponse, invalidRequestResponse } from './responses';
import { getUsenameFromAuthHeader, getUserIdFromAuthHeader } from './utils';

export const redirectManageToWebiny = async (event: any) => {
  return redirect('handleManage', event);
};

export const redirectReadToWebiny = async (event: any) => {
  return redirect('handleRead', event);
};

export const redirectPreviewToWebiny = async (event: any) => {
  return redirect('handlePreview', event);
};

async function redirect(method: string, event: any) {
  const user_id = getUserIdFromAuthHeader(event.headers);
  const username = getUsenameFromAuthHeader(event.headers);

  if (!user_id) {
    throw Error('Unauthorized request');
  }
  try {
    const service: any = new WebinyProxyService(
      <string>process.env.WEBINY_TOKEN,
      <string>process.env.WEBINY_ENDPOINT,
      <string>user_id,
      <string>username
    );
    const response = await service[method](event.body);
    return successResponse(response);
  } catch (e: any) {
    console.error(`Error invoking WebinyProxyService.${method}`, e);
    return invalidRequestResponse(e);
  }
}
