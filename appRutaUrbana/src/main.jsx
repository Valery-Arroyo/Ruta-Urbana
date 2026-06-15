import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom'; 
import App from './App';
import { Home } from './components/Home/Home';
import { PageNotFound } from './components/Home/PageNotFound';
import ListaProducto from './Producto/Form/ListaProducto';
import DetalleProducto from './Producto/Form/DetalleProducto';

const rutas = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/productos',
        element: <ListaProducto />
      },
      {
        path: '/productos/:id', // Corregido: 'productos' en plural para coincidir con el navigate
        element: <DetalleProducto />
      },
      {
        path: '*',
        element: <PageNotFound />
      }
    ],
  },
]);
  
createRoot(document.getElementById('root')).render( 
  <StrictMode> 
      <RouterProvider router={rutas} /> 
  </StrictMode>, 
); 


