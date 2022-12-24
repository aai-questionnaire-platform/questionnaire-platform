import { ApolloError } from '@apollo/client/errors';
import Alert from '@mui/material/Alert';

interface ErrorProps {
  error: ApolloError;
}

const Error = ({ error }: ErrorProps) => {
  return <Alert severity="error">{error.message}</Alert>;
};

export default Error;
