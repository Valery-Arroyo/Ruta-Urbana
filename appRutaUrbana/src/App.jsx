import { CssBaseline, ThemeProvider } from "@mui/material";
import { appTheme } from "./themes/theme";
import Layout from "./components/Layout/Layout";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline enableColorScheme />

      <Layout />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
        }}
      />
    </ThemeProvider>
  );
}
