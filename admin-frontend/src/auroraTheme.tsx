import { red } from '@mui/material/colors';
import { createTheme, ThemeOptions } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    primary: {
      main: '#006efd',
      dark: '#00439b',
      light: '#ebf3ff',
    },
    secondary: {
      main: '#f82457',
    },
    background: {
      default: '#f9fafa',
    },
    success: {
      main: '#00997f',
    },
    error: {
      main: red[500],
    },
    warning: {
      main: '#fff066',
    },
    grey: {
      100: '#f2f2f2',
    },
    text: {
      primary: '#2e3238',
      secondary: '#656d77',
    },
  },

  typography: {
    fontFamily: ['"IBM Plex Sans"', 'sans-serif'].join(','),
  },
});

theme = createTheme(theme, {
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: theme.palette.text.primary,
        },
        h1: {
          fontSize: '2.625rem',
          fontWeight: 400,
          letterSpacing: 0,
          marginBottom: theme.spacing(4),
        },
        h2: {
          fontSize: '1.5rem',
          lineHeight: '2rem',
          fontWeight: 500,
          marginBottom: theme.spacing(2),
        },
        h3: {
          fontSize: '1.5rem',
        },
        h4: {
          fontSize: '1.125rem',
          fontWeight: 'bold',
        },
        h5: {
          fontSize: '1rem',
        },
        h6: {
          fontSize: '1rem',
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.5rem',
          paddingTop: theme.spacing(3),
        },
      },
    },

    MuiDialogContentText: {
      styleOverrides: {
        root: {
          color: theme.palette.text.primary,
        },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: theme.spacing(0, 3, 3, 3),
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        outlined: {
          backgroundColor: '#fff',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          textTransform: 'none',
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          color: theme.palette.text.primary,
        },
      },
    },
  },
} as ThemeOptions);

export default theme;
