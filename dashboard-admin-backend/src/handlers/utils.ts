import { APIGatewayProxyEventHeaders } from 'aws-lambda';
import jwt_decode from 'jwt-decode';

export function getResponseHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };
}
