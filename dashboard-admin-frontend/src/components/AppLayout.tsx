import { Box } from "@mui/system";
import { Container } from "@mui/material";

import AppDrawer from "./AppDrawer/AppDrawer";
import AppHeader from "./AppHeader/AppHeader";
import React, { useState } from "react";
import AppMain from "./AppMain";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isOpen, setOpen] = useState(true);
  const drawerWidth = 250;

  const toggleDrawer = () => {
    setOpen(!isOpen);
  };

  return (
    <Box display="flex" flex={1}>
      <AppHeader drawerIsOpen={isOpen} toggleDrawer={toggleDrawer} />

      <AppDrawer isOpen={isOpen} close={toggleDrawer} width={drawerWidth} />

      <AppMain isOpen={isOpen}>
        <Container maxWidth="md" sx={{ pt: 2 }}>
          {children}
        </Container>
      </AppMain>
    </Box>
  );
};

export default AppLayout;
