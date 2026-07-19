<?php
class Estacion
{
    public function index()
    {
        try {
            $response = new Response();
            $estacion = new EstacionModel();
            $result = $estacion->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}