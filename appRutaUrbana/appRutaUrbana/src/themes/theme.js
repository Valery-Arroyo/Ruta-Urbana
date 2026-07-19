import { createTheme } from '@mui/material/styles'; 
export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#EC731E',
    },
    secondary: {
      main: '#111111',
    },
    primaryLight: {
      main: '#F7F7F7',
      contrastText: '#111111'
    }
  },
});