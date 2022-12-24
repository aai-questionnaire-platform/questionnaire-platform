import { JwksClient } from 'jwks-rsa';
import { promisify } from 'util';
import { decode, verify } from 'jsonwebtoken';
import logger from '../../services/log-service';

// Adopted from https://github.com/auth0-samples/jwt-rsa-aws-custom-authorizer

export const handler = async (event: any, context: any) => {
  let data;
  try {
    data = await authenticate(event);
  } catch (err) {
    logger.error(err);
    return context.fail('Unauthorized');
  }
  return data;
};

const jwtOptions = {
  audience: process.env.JWT_AUDIENCE,
  issuer: process.env.JWT_ISSUER,
};

const client = new JwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10, // Default value
  jwksUri: jwtOptions.issuer + '/.well-known/jwks.json',
});

const getPolicyDocument = (effect: string, methodArn: string) => {
  // parse the ARN from the incoming resource
  const methodArnComponents = methodArn.split(':');
  const apiOptions = methodArnComponents[5].split('/');
  methodArnComponents[5] = [apiOptions[0], apiOptions[1], '*'].join('/');
  const resource = methodArnComponents.join(':');
  return {
    Version: '2012-10-17', // default version
    Statement: [
      {
        Action: 'execute-api:Invoke', // default action
        Effect: effect,
        Resource: resource,
      },
    ],
  };
};

// extract and return the Bearer Token from the Lambda event parameters
const getToken = (params: any) => {
  if (!params.type || params.type !== 'TOKEN') {
    throw new Error('Expected "event.type" parameter to have value "TOKEN"');
  }

  const tokenString = params.authorizationToken;
  if (!tokenString) {
    throw new Error('Expected "event.authorizationToken" parameter to be set');
  }

  const match = tokenString.match(/^Bearer (.*)$/);
  if (!match || match.length < 2) {
    throw new Error(
      `Invalid Authorization token - ${tokenString} does not match "Bearer .*"`
    );
  }
  return match[1];
};

const authenticate = (params: any) => {
  const token = getToken(params);
  const decoded = decode(token, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error('invalid token');
  }

  const getSigningKey = promisify(client.getSigningKey);
  return getSigningKey(decoded.header.kid)
    .then((key: any) => {
      const signingKey = key.publicKey || key.rsaPublicKey;
      return verify(token, signingKey, jwtOptions);
    })
    .then((decoded: any) => ({
      principalId: decoded.sub,
      policyDocument: getPolicyDocument('Allow', params.methodArn),
      context: { scope: decoded.scope },
    }));
};
