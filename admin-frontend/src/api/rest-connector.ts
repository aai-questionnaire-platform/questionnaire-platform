import { formApiUrl, withAuthHeader, withUrlParams } from './utils';

/**
 * An error caused by an invalid request
 * @class InvalidRequestError
 * @extends {Error}
 */
export class ServerResponseError extends Error {
  status = 0;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const fetchFromApi = async (url: string, options: RequestInit) => {
  try {
    const response = await fetch(formApiUrl(url), options);

    if (response.ok) {
      return response;
    }

    // in case of 404 the request does not fail but is marked not ok
    throw new ServerResponseError(response.statusText, response.status);
  } catch (e: any) {
    // if already a server response error then just pass the error onward
    if (e.status) {
      throw e;
    }

    // if the error thrown was not a ServerResponseError then the request
    // failed altogether and it has neither statusText nor status
    // this can be a result of CORS or connection error
    throw new ServerResponseError(e.message, 0);
  }
};

/**
 * Do a get request
 * @async
 */
export const get = (path: string, headers?: Record<string, string>) =>
  fetchFromApi(path, {
    method: 'GET',
    headers: withAuthHeader(headers),
  });

/**
 * Do a post request
 * @async
 */
export const post = (
  path: string,
  headers?: Record<string, string>,
  body?: string
) =>
  fetchFromApi(path, {
    method: 'POST',
    headers: withAuthHeader(headers),
    body,
  });

/**
 * Do a put request
 * @async
 */
export const put = (
  path: string,
  headers?: Record<string, string>,
  body?: string
) =>
  fetchFromApi(path, {
    method: 'PUT',
    headers: withAuthHeader(headers),
    body,
  });

/**
 * Do a delete request
 * @async
 */
export const del = (path: string, headers?: Record<string, string>) =>
  fetchFromApi(path, {
    method: 'DELETE',
    headers: withAuthHeader(headers),
  });

type HttpVerbFn = typeof get | typeof post | typeof put | typeof del;

async function requestAndParseJSON(
  method: HttpVerbFn,
  path: string,
  body?: string
) {
  const headers = withAuthHeader({
    Accept: 'application/json',
    ...(body && {
      'Content-Type': 'application/json',
    }),
  });
  const response = await method(path, headers, body);

  return response.json();
}

/**
 * Do a get request and parse it's body (JSON)
 * @see {get}
 */
export const getJSON = (
  path: string,
  params: Record<string, string | number> = {}
) => requestAndParseJSON(get, withUrlParams(path, params));

/**
 * Do a post request and parse it's body (JSON)
 * @see {post}
 */
export const postJSON = (
  path: string,
  params: Record<string, string | number>,
  body: Record<string, any>
) =>
  requestAndParseJSON(post, withUrlParams(path, params), JSON.stringify(body));

/**
 * Do a put request and parse it's body (JSON)
 * @see {put}
 */
export const putJSON = (
  path: string,
  params: Record<string, string | number>,
  body: Record<string, any>
) =>
  requestAndParseJSON(put, withUrlParams(path, params), JSON.stringify(body));
