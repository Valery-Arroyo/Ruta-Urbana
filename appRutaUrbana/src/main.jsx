import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Home } from "./components/Home/Home";
import { PageNotFound } from "./components/Home/PageNotFound";
import ListaProducto from "./Producto/Form/ListaProducto";
import DetalleProducto from "./Producto/Form/DetalleProducto";
import DetalleCombo from "./Producto/Form/DetalleCombo";
import ListaCombo from "./Producto/Form/ListaCombo";
import ListaMenu from "./Producto/Form/ListaMenu";
import DetalleMenu from "./Producto/Form/DetalleMenu";
const rutas = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/productos",
        element: <ListaProducto />,
      },
      {
        path: "/productos/:id",
        element: <DetalleProducto />,
      },
      {
        path: "/combos",
        element: <ListaCombo />,
      },
      {
        path: "/combos/:id",
        element: <DetalleCombo />,
      },
      {
        path: "/menu",
        element: <ListaMenu />,
      },
            {
        path: "/menu/:id",
        element: <DetalleMenu/>,
      },
      {
        path: "*",
        element: <PageNotFound />,
      }
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={rutas} />
  </StrictMode>,
);
