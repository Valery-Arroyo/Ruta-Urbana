import { CssBaseline, ThemeProvider } from "@mui/material";
import { appTheme } from "./themes/theme";
import { Layout } from "./components/Layout/Layout";
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Importación necesaria

export default function App() { 
  return ( 
      <ThemeProvider theme={appTheme}> 
        <CssBaseline enableColorScheme /> 
        <Toaster position="top-right" reverseOrder={false} /> {/* Configuración global */}
        <Layout> 
          <Outlet /> 
        </Layout> 
      </ThemeProvider>
  ); 
}