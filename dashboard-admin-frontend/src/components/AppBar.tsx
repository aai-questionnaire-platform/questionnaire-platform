import { styled } from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";

interface AppBarProps extends MuiAppBarProps {
  isOpen: boolean;
  width: number;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "isOpen",
})<AppBarProps>(({ theme, isOpen, width }) => ({
  boxShadow: "none",
  backgroundColor: theme.palette.background.paper,
  borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(isOpen && {
    width: `calc(100% - ${width}px)`,
    marginLeft: `${width}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export default AppBar;
