<?php
class Combo
{
    // Método para obtener todos los combos
    public function index()
    {
        try {
            //La clase Response en tu backend es una utilidad que se encarga de 
           // formatear y devolver las respuestas al cliente (frontend) de manera consistente.
            $response = new Response();

            //Crea una instancia del modelo ComboModel, 
            //que se encarga de interactuar con la base de datos
            $combo = new ComboModel();

            //Llama al método "all" del modelo para obtener todos los combos 
            // disponibles en la base de datos
            $result = $combo->all();

            //Utiliza el método "toJSON" del objeto Response para formatear el resultado
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function get($categoria)
    {
        try {
            // Crea un objeto Response, encargado de formatear la respuesta en JSON
            $response = new Response();

            // Crea una instancia del modelo ComboModel, que se encarga de 
            // interactuar con la base de datos
            $combo = new ComboModel();

            // Llama al método "get" del modelo, pasando la categoría como parámetro,
            // para obtener los combos que pertenecen a esa categoría
            $result = $combo->get($categoria);

            // Utiliza el método "toJSON" del objeto Response para formatear el resultado
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getCombo($id)
    {
        try {
            // Crea un objeto Response, encargado de formatear la respuesta en JSON
            $response = new Response();

            // Crea una instancia del modelo ComboModel, que se encarga de 
            // interactuar con la base de datos
            $combo = new ComboModel();

            // CAMBIO AQUÍ: Llama al método correcto del modelo para buscar por ID, no por categoría
            $result = $combo->get($id);

            // Utiliza el método "toJSON" del objeto Response para formatear el resultado
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }


    // Crear un nuevo Combo
    public function create()
    {
        try {
            $response = new Response();
            $combo = new ComboModel();
            
            $data = json_decode(file_get_contents("php://input"), true);
            
            $result = $combo->create($data);
            $response->toJSON(['id' => $result]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Actualizar un Combo existente
    public function update($id)
    {
        try {
            $response = new Response();
            $combo = new ComboModel();
            
            $data = json_decode(file_get_contents("php://input"), true);
            
            $result = $combo->update($id, $data);
            $response->toJSON(['success' => $result]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Eliminar (Inhabilitar) un Combo
    public function delete($id)
    {
        try {
            $response = new Response();
            $combo = new ComboModel();
            
            $result = $combo->delete($id);
            $response->toJSON(['success' => $result]);
        } catch (Exception $e) {
            handleException($e);
        }
    }


}
