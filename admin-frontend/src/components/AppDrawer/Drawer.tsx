import MuiDrawer from '@mui/material/Drawer';
import { styled, Theme, CSSObject } from '@mui/material/styles';

const openedMixin = (theme: Theme, width: number): CSSObject => ({
  width,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  // hide the border too
  marginLeft: '-1px',
  width: 0,
});

interface DrawerProps {
  width: number;
}

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})<DrawerProps>(({ theme, open, width }) => ({
  width,
  'flexShrink': 0,
  'whiteSpace': 'nowrap',
  '& .MuiDrawer-paper': openedMixin(theme, width),
  ...(open && {
    ...openedMixin(theme, width),
    '& .MuiDrawer-paper': {
      ...openedMixin(theme, width),
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
  '& .MuiList-root': {
    padding: theme.spacing(0, 1),
  },
}));

export default Drawer;
