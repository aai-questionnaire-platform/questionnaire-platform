import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    error: string;
    lightgray: string;
    primary: string;
    secondary: string;
    text: string;
    white: string;
    disabled: string;
  }
}
export type Dict<T> = Record<string, T>;
