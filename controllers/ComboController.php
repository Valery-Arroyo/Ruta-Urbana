<?php
class Combo
{
    public function index()
    {
        try {
            $response = new Response();
            $combo = new ComboModel();
            $result = $combo->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function get($categoria)
    {
        try {
            $response = new Response();
            $producto = new ComboModel();
            $result = $producto->get($categoria);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getCombo($id)
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
