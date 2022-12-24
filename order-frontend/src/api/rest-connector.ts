import { toAAILogin } from '@/components/AuthenticatedRoute/utils';
import { getCookie, setCookie } from '@/util/storage';
import { ApiResponseError, withAuthHeader } from './utils';

export const postWithoutAuth = async (body: any, endpoint: string) => {
  return handleResponse(() =>
    fetch(`${process.env.REACT_APP_API_HOST}/${endpoint}`, {
      method: 'POST',
      mode: 'cors',
      body: body,
    })
  );
};

export const postWithAuth = async (body: any, endpoint: string) => {
  return handleResponse(
    () =>
      fetch(`${process.env.REACT_APP_API_HOST}/${endpoint}`, {
        method: 'POST',
        headers: withAuthHeader(),
        mode: 'cors',
        body: body,
      }),
    true
  );
};

export const getWithAuth = async (endpoint: string) => {
  return handleResponse(
    () =>
      fetch(`${process.env.REACT_APP_API_HOST}/${endpoint}`, {
        method: 'GET',
        headers: withAuthHeader(),
      }),
    true
  );
};

async function handleResponse(
  fetcherFunction: any,
  refreshAccesTokenIfExpired = false
) {
  try {
    const res = await fetcherFunction();

    if (refreshAccesTokenIfExpired) {
      const accessToken = getCookie('accessToken');
      //If token is expired (401), redirect to AAI-login
      if (res.status === 401 && accessToken) {
        setCookie({ accessToken: '' }, -1);
        toAAILogin();
      }
    }

    // If the status code is not in the range 200-299,
    // we still try to parse and throw it.
    if (!res.ok) {
      throw new ApiResponseError(
        res.statusText || 'An error occurred while fetching the data.',
        res.status
      );
    }

    return res.json();
  } catch (e: any) {
    // if already a server response error then just pass the error onward
    if (e.status) {
      throw e;
    }

    // if the error thrown was not a ServerResponseError then the request
    // failed altogether and it has neither statusText nor status
    // this can be a result of CORS or connection error
    throw new ApiResponseError(e.message, 0);
  }
}
