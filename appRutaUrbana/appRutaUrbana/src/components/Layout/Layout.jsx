import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

import Header from "./Header";
import { Footer } from "./Footer";

export default function Layout() {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        m: 0,
        p: 0,
      }}
    >
      <Header />

      <Box
        component="main"
        sx={{
          width: "100%",
          flexGrow: 1,
          m: 0,
          p: 0,
          bgcolor: "#ffffff",
        }}
      >
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
}
