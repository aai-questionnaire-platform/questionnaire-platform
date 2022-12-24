import { APIGatewayProxyEventHeaders } from 'aws-lambda';
import jwt_decode from 'jwt-decode';

export function getResponseHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };
}

/**
 * Get user id from a jwt token
 * @param token
 * @returns
 */
export function getUserIdFromToken(token: string | undefined): string {
  const idToken = getIdTokenFromAuthHeader(token);
  return jwt_decode<{ sub: string }>(<string>idToken).sub;
}

/**
 * Get user id from Authorization header
 * @param headers
 * @returns
 */
export function getUserIdFromAuthHeader(headers: APIGatewayProxyEventHeaders) {
  try {
    return getUserIdFromToken(headers.Authorization);
  } catch (e) {
    return undefined;
  }
}

export function getIdTokenFromAuthHeader(
  token: string | undefined
): string | undefined {
  return token?.split(' ')[1];
}
