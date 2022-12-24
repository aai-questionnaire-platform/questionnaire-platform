import type { ErrorResponse } from '../datamodels/error-response';

function getResponseHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };
}

function apiResponseFromError(statusCode: number, message = ''): ErrorResponse {
  return {
    statusCode,
    message,
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

export function invalidRequestResponse(error: Error) {
  return {
    statusCode: 400,
    headers: getResponseHeaders(),
    body: JSON.stringify(
      apiResponseFromError(400, `Error handling request: ${error.message}`)
    ),
  };
}

export function unAuthorizedResponse() {
  return {
    statusCode: 401,
    headers: getResponseHeaders(),
    body: JSON.stringify(apiResponseFromError(401, 'Unauthorized')),
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
