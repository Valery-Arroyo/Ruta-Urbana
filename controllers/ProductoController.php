<?php
class Producto
{
    public function index()
    {
        try {
            $response = new Response();
            $producto = new ProductoModel();
            $result = $producto->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function get($categoria)
    {
        try {
            $response = new Response();
            $producto = new ProductoModel();
            $result = $producto->get($categoria);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getProducto($id)
    {
        try {
            $response = new Response();
            $producto = new ProductoModel();
            $result = $producto->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}