import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import fetch from 'cross-fetch';

export function createApolloClient(path: string) {
  const token = process.env.WEBINY_TOKEN;
  const baseURL = process.env.WEBINY_ENDPOINT;

  const httpLink = createHttpLink({
    uri: baseURL + path,
    fetch,
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return client;
}
