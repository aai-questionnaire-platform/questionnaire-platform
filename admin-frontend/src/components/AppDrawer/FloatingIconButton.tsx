import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import * as R from 'ramda';

const buttonSx = {
  'color': 'primary.main',
  'boxShadow':
    '0px 0.5px 4px rgba(0, 0, 0, 0.1), 0px 8px 16px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    backgroundColor: '#eeeff1',
    boxShadow: 'none',
  },
};

const FloatingIconButton = ({ children, sx, ...rest }: IconButtonProps) => {
  return (
    <IconButton {...rest} sx={sx ? R.mergeDeepRight(buttonSx, sx) : buttonSx}>
      {children}
    </IconButton>
  );
};

export default FloatingIconButton;
