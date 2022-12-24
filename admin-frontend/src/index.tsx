import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import client from './api/client';
import App from './App';
import theme from './auroraTheme';
import './i18n';
import './index.css';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <StrictMode>
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </ApolloProvider>
  </StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
