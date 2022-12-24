import fetch from 'cross-fetch';
import type { Dict } from '../../types';
import { ServerResponseError } from './server-response-error';
import { withAuthHeader, withJSONContentHeader, withUrlParams } from './utils';

export class RestConnector {
  constructor(private host: string, private authToken: string) {}

  /**
   * Do a get request
   * @async
   */
  get(path: string, headers?: Dict<string>) {
    return this.fetchFromApi(path, {
      method: 'GET',
      headers: withAuthHeader(this.authToken, headers),
    });
  }

  /**
   * Do a post request
   * @async
   */
  post(path: string, headers?: Dict<string>, body?: string) {
    return this.fetchFromApi(path, {
      method: 'POST',
      headers: withAuthHeader(this.authToken, withJSONContentHeader(headers)),
      body,
    });
  }

  /**
   * Do a put request
   * @async
   */
  put(path: string, headers?: Dict<string>, body?: string) {
    return this.fetchFromApi(path, {
      method: 'PUT',
      headers: withAuthHeader(this.authToken, withJSONContentHeader(headers)),
      body,
    });
  }

  /**
   * Do a get request and parse it's body (JSON)
   * @see {get}
   */
  getJSON(path: string, params: Dict<any> = {}) {
    return this.requestAndParseJSON(this.get, withUrlParams(path, params));
  }

  /**
   * Do a post request and parse it's body (JSON)
   * @see {post}
   */
  postJSON(path: string, body: Dict<any>) {
    return this.post(path, {}, JSON.stringify(body));
  }

  /**
   * Do a put request and parse it's body (JSON)
   * @see {put}
   */
  putJSON(path: string, body: Dict<any>) {
    return this.requestAndParseJSON(this.put, path, JSON.stringify(body));
  }

  /**
   * Parse response object's json body
   * @param response
   * @throws {ServerResponseError}
   */
  private parseJSONBody(response: Response) {
    return response.json();
  }

  /**
   * Do a request and parse it's body
   * @private
   */
  private requestAndParseJSON(method: any, path: string, body?: string) {
    return method
      .call(this, path, { Accept: 'application/json' }, body)
      .then(this.parseJSONBody);
  }

  private formApiUrl(path: string) {
    return `${this.host}/${path}`;
  }

  private async fetchFromApi(url: string, options: RequestInit) {
    try {
      const response = await fetch(this.formApiUrl(url), options);

      if (response.ok) {
        return response;
      }

      // in case of 404 the request does not fail but is marked not ok
      throw new ServerResponseError(response.statusText, response.status);
    } catch (e: any) {
      console.error('error fetching from', url, e);
      // if already a server response error then just pass the error onward
      if (e.status) {
        throw e;
      }

      // if the error thrown was not a ServerResponseError then the request
      // failed altogether and it has neither statusText nor status
      // this can be a result of CORS or connection error
      throw new ServerResponseError(e.message, 0);
    }
  }
}
