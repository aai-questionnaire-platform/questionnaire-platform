import styled from 'styled-components';

import ButtonBase from '@/components/Button/ButtonBase';

const PrimaryButton = styled(ButtonBase)`
  height: 3rem;

  background-color: ${({ theme, bgColor }) =>
    bgColor || theme.primaryButton.default.bgColor};
  color: ${({ theme, fgColor }) =>
    fgColor || theme.primaryButton.default.fgColor};

  &:hover,
  &:active {
    background-color: ${({ theme, activeBgColor }) =>
      activeBgColor || theme.primaryButton.active.bgColor};
    color: ${({ theme, activeFgColor }) =>
      activeFgColor || theme.primaryButton.active.fgColor};
  }
  &[aria-disabled='true'] {
    background-color: ${({ theme, disabledBgColor }) =>
      disabledBgColor || theme.primaryButton.disabled.bgColor};
    color: ${({ theme, disabledFgColor }) =>
      disabledFgColor || theme.primaryButton.disabled.fgColor};
  }
`;

export default PrimaryButton;
