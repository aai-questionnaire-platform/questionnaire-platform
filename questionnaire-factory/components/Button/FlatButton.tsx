import styled from 'styled-components';

import ButtonBase from '@/components/Button/ButtonBase';

const FlatButton = styled(ButtonBase)`
  outline-offset: 8px;

  background-color: transparent;
  color: ${({ theme, fgColor }) => fgColor || theme.flatButton.default.fgColor};

  &:hover,
  &:active {
    color: ${({ theme, activeFgColor }) =>
      activeFgColor || theme.flatButton.active.fgColor};
  }

  &[aria-disabled='true'] {
    color: ${({ theme, disabledFgColor }) =>
      disabledFgColor || theme.flatButton.fgColor};
  }
`;

export default FlatButton;
