import {
  from,
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { formApiUrl } from '../api/utils';
import { getCookie } from '../util/storage';
import MutationQueueLink from './MutationQueueLink';
import { usersVar } from './reactiveVars';

const previewLink = new HttpLink({
  uri: formApiUrl('preview'),
});

const manageLink = new HttpLink({
  uri: formApiUrl('manage'),
});

const authLink = setContext((_, { headers }) => {
  const accessToken = getCookie('accessToken');

  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  };
});

const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        users: {
          read() {
            return usersVar();
          },
        },
      },
    },
  },
});

const clientLink = authLink.concat(
  ApolloLink.split(
    (operation) => operation.getContext().clientName === 'manage',
    manageLink, // <= apollo will send to this if clientName is "manage"
    previewLink // <= otherwise will send to this
  )
);

const client = new ApolloClient({
  link: from([new MutationQueueLink(), clientLink]),
  cache,
  defaultOptions: {
    query: {
      notifyOnNetworkStatusChange: true,
    },
  },
});

export default client;
