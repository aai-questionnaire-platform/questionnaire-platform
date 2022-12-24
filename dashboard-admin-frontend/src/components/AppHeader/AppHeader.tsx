// import { useReactiveVar } from "@apollo/client";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
// import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
// import { useTranslation } from "react-i18next";
// import { isProcessingMutationsVar } from "../../api/reactiveVars";
import AppBar from "../AppBar";

const drawerWidth = 250;

interface AppHeaderProps {
  drawerIsOpen: boolean;
  toggleDrawer: () => void;
}

const AppHeader = ({ drawerIsOpen, toggleDrawer }: AppHeaderProps) => {
  // const isProcessingMutations = useReactiveVar(isProcessingMutationsVar);
  // const { t } = useTranslation();

  return (
    <AppBar position="fixed" isOpen={drawerIsOpen} width={drawerWidth}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box display="flex" flexDirection="row" alignItems="center">
          {!drawerIsOpen && (
            <IconButton
              color="inherit"
              // aria-label={t("openDrawer")}
              aria-label="Avaa"
              edge="start"
              onClick={toggleDrawer}
              sx={{
                mr: 2,
                color: "primary.main",
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography color="text.primary">Kotinäkymän hallinta</Typography>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          sx={{ "& > :not(:last-child)": { mr: 1 } }}
        >
          {/* {isProcessingMutations && (
            <CircularProgress size={20} sx={{ mr: 1 }} />
          )} */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
