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
