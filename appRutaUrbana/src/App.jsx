import { CssBaseline, ThemeProvider } from "@mui/material";
import { appTheme } from "./themes/theme";
import Layout from "./components/Layout/Layout";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { PedidoEnCursoProvider } from "./context/PedidoEnCursoContext";

export default function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline enableColorScheme />

      <AuthProvider>
        <PedidoEnCursoProvider>
          <Layout />
        </PedidoEnCursoProvider>
      </AuthProvider>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
        }}
      />
    </ThemeProvider>
  );
}
