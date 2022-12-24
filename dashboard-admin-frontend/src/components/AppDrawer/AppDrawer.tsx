import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import { Link } from "react-router-dom";
// import { useTranslation } from 'react-i18next';

import AppDrawerListItem from "./AppDrawerListItem";
import Drawer from "../Drawer";
import DrawerHeader from "./DrawerHeader";
import FloatingIconButton from "./FloatingIconButton";
import styled from "styled-components";

interface AppDrawerProps {
  isOpen: boolean;
  close: VoidFunction;
  width: number;
}

const Username = styled.p`
  color: #1a76d3;
  font-weight: bold;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const StyledLogout = styled(StyledLink)`
  color: #494949;
`;

const AppDrawer = ({ isOpen, close, width }: AppDrawerProps) => {
  // const { t } = useTranslation();

  return (
    <Drawer
      open={isOpen}
      variant="permanent"
      width={width}
      data-cy="side-navigation-drawer"
    >
      <DrawerHeader>
        <Username>Adminkäyttäjä</Username>
        <FloatingIconButton
          onClick={close}
          // aria-label={t("closeDrawer")}
          aria-label="Sulje"
          sx={{ mr: 0.25 }}
        >
          <ChevronLeftIcon />
        </FloatingIconButton>
      </DrawerHeader>

      <Box component="nav">
        <Divider sx={{ my: 1 }} />

        <List>
          <StyledLink to="/">
            <AppDrawerListItem component="button">Palvelut</AppDrawerListItem>
          </StyledLink>
          <StyledLink to="/categories">
            <AppDrawerListItem component="button">Kategoriat</AppDrawerListItem>
          </StyledLink>
          <Divider light />
          <StyledLogout to="/logout">
            <AppDrawerListItem component="button">
              {/* {t("logout")} */}
              Kirjaudu ulos
            </AppDrawerListItem>
          </StyledLogout>
        </List>
      </Box>
    </Drawer>
  );
};

export default AppDrawer;
