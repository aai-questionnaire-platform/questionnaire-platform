import { styled } from '@mui/material';

const AppMain = styled('main', {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<{
  isOpen?: boolean;
}>(({ theme, isOpen }) => ({
  backgroundColor: theme.palette.background.default,
  flexGrow: 1,
  paddingTop: theme.spacing(12),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(isOpen && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

export default AppMain;
