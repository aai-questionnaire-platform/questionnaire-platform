import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'IBM Plex Sans', sans-serif;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html,
  body {
    height: 100%;
  }

  #root {
    display: flex;
    flex: 1;
    min-height: 100%;
    flex-direction: column;
    white-space: pre-line;
  }
`;

export default GlobalStyle;
