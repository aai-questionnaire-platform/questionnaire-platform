import styled, { css, keyframes } from 'styled-components';

import { CategoryState } from '@/enums';

interface ProgressButtonProps {
  active?: boolean;
  size?: number;
  state: CategoryState;
}

const pulse = ({ theme }: { theme: Record<string, any> }) => keyframes`
  to {
    box-shadow: 0 0 48px ${theme.progress.progressButton.active.pulseColor}66;
  }
`;

const ProgressButton = styled.button<ProgressButtonProps>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;

  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: 50%;
  background-color: ${({ state, theme }) =>
    state === CategoryState.UNLOCKED
      ? theme.progress.progressButton.active.bgColor
      : state === CategoryState.LOCKED
      ? theme.progress.progressButton.disabled.bgColor
      : theme.progress.progressButton.default.bgColor};
  box-shadow: 0px 0.5px 4px rgba(0, 0, 0, 0.1), 0px 8px 16px rgba(0, 0, 0, 0.1);
  ${({ theme }) => theme.progress.font && `font: ${theme.progress.font};`}

  ${({ disabled }) =>
    !disabled &&
    css`
      cursor: pointer;
    `}

  ${({ active }) =>
    active &&
    css`
      animation: ${pulse} 1s ease-in-out infinite;
      animation-direction: alternate;

      background-color: ${({ theme }) =>
        theme.progress.progressButton.active.bgColor};
    `}

  color: ${({ state, theme }) =>
    state === CategoryState.UNLOCKED
      ? theme.progress.progressButton.active.fgColor
      : state === CategoryState.LOCKED
      ? theme.progress.progressButton.disabled.fgColor
      : theme.progress.progressButton.default.fgColor}
`;

ProgressButton.defaultProps = {
  active: false,
  size: 100,
};

export default ProgressButton;
