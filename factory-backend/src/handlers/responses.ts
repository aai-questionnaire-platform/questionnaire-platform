import { ErrorResponse } from '../datamodels/error-response';
import { getResponseHeaders } from './utils';

function apiResponseFromError(
  statusCode: number,
  message: string = '',
  props: Record<string, any> = {}
): ErrorResponse {
  return {
    statusCode,
    message,
    ...props,
  };
}

export function successResponse(body?: Record<string, any>) {
  return {
    statusCode: 200,
    headers: getResponseHeaders(),
    body: body ? JSON.stringify(body) : '{}',
  };
}

export function methodNotSupportedResponse(method: string) {
  return {
    statusCode: 400,
    headers: getResponseHeaders(),
    body: JSON.stringify(
      apiResponseFromError(400, `${method} is not supported`)
    ),
  };
}

export function invalidRequestResponse(msg: string) {
  return {
    statusCode: 400,
    headers: getResponseHeaders(),
    body: JSON.stringify(
      apiResponseFromError(400, `Error handling request: ${msg}`)
    ),
  };
}

export function validationFailedResponse(
  msg: string,
  props: Record<string, any> = {}
) {
  return {
    statusCode: 400,
    headers: getResponseHeaders(),
    body: JSON.stringify(apiResponseFromError(400, msg, props)),
  };
}

export function unAuthorizedResponse() {
  return {
    statusCode: 401,
    headers: getResponseHeaders(),
    body: JSON.stringify(apiResponseFromError(401, 'Unauthorized')),
  };
}

export function resourceNotFoundResponse(msg: string = 'Resource not found') {
  return {
    statusCode: 404,
    headers: getResponseHeaders(),
    body: JSON.stringify(apiResponseFromError(404, msg)),
  };
}

export function conflictResponse(msg: string = 'Conflict') {
  return {
    statusCode: 409,
    headers: getResponseHeaders(),
    body: JSON.stringify(apiResponseFromError(409, msg)),
  };
}

export function serverErrorResponse(error: Error, message?: string) {
  return {
    statusCode: 500,
    headers: getResponseHeaders(),
    body: JSON.stringify(
      apiResponseFromError(500, (message ? message + ' ' : '') + error.message)
    ),
  };
}
