import styled from 'styled-components';

import ButtonBase from '@/components/Button/ButtonBase';

const SecondaryButton = styled(ButtonBase)`
  height: 2.5rem;

  background-color: ${({ theme, bgColor }) =>
    bgColor || theme.secondaryButton.default.bgColor};
  color: ${({ theme, fgColor }) =>
    fgColor || theme.secondaryButton.default.fgColor};
  box-shadow: 0px 0.5px 4px rgba(0, 0, 0, 0.1), 0px 8px 16px rgba(0, 0, 0, 0.1);

  &:hover,
  &:active {
    background-color: ${({ theme, activeBgColor }) =>
      activeBgColor || theme.secondaryButton.active.bgColor};
    color: ${({ theme, activeFgColor }) =>
      activeFgColor || theme.secondaryButton.active.fgColor};
  }

  &[aria-disabled='true'] {
    background-color: ${({ theme, disabledBgColor }) =>
      disabledBgColor || theme.secondaryButton.disabled.bgColor};
    color: ${({ theme, disabledFgColor }) =>
      disabledFgColor || theme.secondaryButton.disabled.fgColor};
  }
`;

export default SecondaryButton;
