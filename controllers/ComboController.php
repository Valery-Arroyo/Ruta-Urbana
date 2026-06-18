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
}
