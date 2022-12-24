import { APIGatewayProxyEventHeaders } from 'aws-lambda';
import jwt_decode from 'jwt-decode';

export function getResponseHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };
}

export function getResponseHeadersWithCaching() {
  return {
    ...getResponseHeaders(),
    'Cache-control': 'public, max-age=86400',
  };
}

export function onlyUnique(value: string, index: number, self: string[]) {
  return self.indexOf(value) === index;
}

/**
 * Get user id from a jwt token
 * @param token
 * @returns
 */
export function getUserIdFromToken(token: string | undefined): string {
  const idToken = token?.split(' ')[1];
  return jwt_decode<{ sub: string }>(<string>idToken).sub;
}

/**
 * Get user id from Authorization header
 * @param headers
 * @returns
 */
export function getUserIdFromAuthHeader(headers: APIGatewayProxyEventHeaders) {
  try {
    return getUserIdFromToken(headers.Authorization!);
  } catch (e) {
    console.error('getUserIdFromAuthHeader error', e);
    return undefined;
  }
}

export function valueFromEnum<E>(e: E, str?: string) {
  return str ? e[str as keyof typeof e] : undefined;
}
