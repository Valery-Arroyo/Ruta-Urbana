<?php
class Preparacion
{
    public function index()
    {
        try {
            $response = new Response();
            $preparacion = new PreparacionModel();
            $result = $preparacion->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Obtener preparaciones de productos
    public function get($idProducto)
    {
        try {
            $response = new Response();
            $preparacion = new PreparacionModel();
            $result = $preparacion->get($idProducto);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Obtener preparaciones por combo
    public function getProcesoCombo($idCombo)
    {
        try {
            $response = new Response();
            $preparacion = new PreparacionModel();
            $result = $preparacion->getProcesoCombo($idCombo);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Enrutador de acciones personalizadas para resolver llamadas directas desde el Frontend
     * Ej: /preparacion/getProcesoPreparacion/6 o /preparacion/getProcesoCombo/6
     */
    public function __call($name, $arguments)
    {
        if ($name === 'getProcesoPreparacion') {
            $id = isset($arguments[0]) ? $arguments[0] : null;
            $this->get($id);
        } else {
            $response = new Response();
            $response->toJSON(["status" => 404, "result" => "Método no encontrado"]);
        }
    }
}