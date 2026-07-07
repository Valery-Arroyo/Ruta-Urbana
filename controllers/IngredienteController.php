<?php

class IngredienteController
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
            $resultado = $this->model->all();
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }


    /* Obtener ingrediente por ID */
    public function get($id)
    {
        try {
            $resultado = $this->model->get($id);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }


    /* Crear ingrediente */
    public function create($data)
    {
        try {
            $resultado = $this->model->create($data);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }


    /* Actualizar ingrediente */
    public function update($id, $data)
    {
        try {
            $resultado = $this->model->update($id, $data);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }


    /* Eliminar ingrediente */
    public function delete($id)
    {
        try {
            $resultado = $this->model->delete($id);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
