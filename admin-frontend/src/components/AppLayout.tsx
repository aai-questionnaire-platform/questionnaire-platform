import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import paths from '../routes/paths';
import AppBreadcrumbs from './AppBreadcrumbs';
import AppDrawer from './AppDrawer';
import AppHeader from './AppHeader';
import AppLoaderDialogs from './AppLoaderDialogs';
import AppMain from './AppMain';

const drawerWidth = 250;

const AppLayout: React.FC = ({ children }) => {
  const [isOpen, setOpen] = useState(true);
  const { pathname } = useLocation();

  const toggleDrawer = () => {
    setOpen(!isOpen);
  };

  const renderBreadcrumbs = pathname !== paths.HOME && pathname !== paths.LOGIN;

  return (
    <Box display="flex" flex={1}>
      <AppHeader drawerIsOpen={isOpen} toggleDrawer={toggleDrawer} />

      <AppDrawer isOpen={isOpen} close={toggleDrawer} width={drawerWidth} />

      <AppMain isOpen={isOpen}>
        <Container maxWidth="md" sx={{ pt: 2 }}>
          {renderBreadcrumbs && <AppBreadcrumbs />}
          {children}
          <AppLoaderDialogs />
        </Container>
      </AppMain>
    </Box>
  );
};

export default AppLayout;
