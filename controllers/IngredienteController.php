<?php

class Ingrediente
{
    private $model;

    public function __construct()
    {
        $this->model = new IngredienteModel();
    }

    /* Listar ingredientes */
    public function index()
    {
        try {
            AuthMiddleware::verificar(['Administrador', 'Encargado']);

            $response = new Response();
            $resultado = $this->model->all();
            $response->toJSON($resultado);
        } catch (Exception $e) {
            handleException($e);
        }
    }


    /* Obtener ingrediente por ID */
    public function get($id)
    {
        try {
            AuthMiddleware::verificar(['Administrador', 'Encargado']);

            $resultado = $this->model->get($id);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Crear ingrediente */
    public function create()
    {
        try {
            AuthMiddleware::verificar(['Administrador']);

            $request = new Request();
            $data = (array) $request->getJSON();

            $response = new Response();
            $resultado = $this->model->create($data);

            $response->toJSON(['success' => $resultado]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Actualizar ingrediente */
    public function update($id)
    {
        try {
            AuthMiddleware::verificar(['Administrador']);

            $request = new Request();

            // Convertir el objeto a arreglo
            $data = (array) $request->getJSON();

            $response = new Response();
            $resultado = $this->model->update($id, $data);

            $response->toJSON(['success' => $resultado]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Eliminar ingrediente */
    public function delete($id)
    {
        try {
            AuthMiddleware::verificar(['Administrador']);

            $resultado = $this->model->delete($id);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
