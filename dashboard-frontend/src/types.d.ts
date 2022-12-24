import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    error: string;
    gray: string;
    lightgray: string;
    primary: string;
    secondary: string;
    statusIndicator: string;
    text: string;
    white: string;
  }
}
