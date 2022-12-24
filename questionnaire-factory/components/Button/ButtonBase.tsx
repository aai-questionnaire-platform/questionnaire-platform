import { HTMLProps, ReactNode } from 'react';
import styled, { css } from 'styled-components';

import { ButtonVariant } from '@/schema/Components';

export interface ButtonProps extends HTMLProps<HTMLButtonElement> {
  type?: 'button' | 'submit' | 'reset' | '';
  iconOnly?: boolean;
  variant?: ButtonVariant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;

  /**
   * Optional color overrides
   */
  bgColor?: string;
  fgColor?: string;
  activeBgColor?: string;
  activeFgColor?: string;
  disabledBgColor?: string;
  disabledFgColor?: string;
}

const ButtonBase = styled.button<ButtonProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  border-radius: 999px;

  border: 0;
  font-weight: 600;
  font: 1rem 'IBM Plex Sans', sans-serif;
  line-height: 1.5rem;
  white-space: nowrap;

  cursor: pointer;
  transition: all 0.2s;

  &[aria-disabled='true'] {
    pointer-events: none;
  }

  *:not(:first-child) {
    margin-left: 0.5rem;
  }

  padding: 0 1.5rem;

  ${({ iconOnly }) =>
    iconOnly &&
    css`
      aspect-ratio: 1 / 1;
      padding: 0;
      justify-content: center;
      align-items: center;
    `}

  text-decoration: none;
`;

export default ButtonBase;
