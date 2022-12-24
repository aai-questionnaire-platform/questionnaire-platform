import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import { useTranslation } from 'react-i18next';
import { logout } from './utils';
import paths from '../../routes/paths';
import AppDrawerListItem from './AppDrawerListItem';
import Drawer from './Drawer';
import DrawerHeader from './DrawerHeader';
import DrawerQuestionnaireList from './DrawerQuestionnaireList';
import FloatingIconButton from './FloatingIconButton';
import NavEntry from './NavEntry';

interface AppDrawerProps {
  isOpen: boolean;
  close: VoidFunction;
  width: number;
}

const AppDrawer = ({ isOpen, close, width }: AppDrawerProps) => {
  const { t } = useTranslation();

  return (
    <Drawer
      open={isOpen}
      variant="permanent"
      width={width}
      data-cy="side-navigation-drawer"
    >
      <DrawerHeader>
        <FloatingIconButton
          onClick={close}
          aria-label={t('closeDrawer')}
          sx={{ mr: 0.25 }}
        >
          <ChevronLeftIcon />
        </FloatingIconButton>
      </DrawerHeader>

      <Box component="nav">
        <DrawerQuestionnaireList />

        <Divider sx={{ my: 1 }} />

        <List>
          <NavEntry to={paths.HELP}>{t('help')}</NavEntry>
          <AppDrawerListItem component="button" onClick={logout}>
            {t('logout')}
          </AppDrawerListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default AppDrawer;
