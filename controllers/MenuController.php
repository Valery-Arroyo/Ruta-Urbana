<?php
class Menu
{
    // Método para obtener todos los menús
    public function index()
    {
        // La clase Response en tu backend es una utilidad que se encarga de 
        // formatear y devolver las respuestas al cliente (frontend) de manera consistente.
        try {
            $response = new Response();
            $menu = new MenuModel();
            $result = $menu->all();
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

            // Crea una instancia del modelo MenuModel, que se encarga de 
            //interactuar con la base de datos
            $menu = new MenuModel();

            // Llama al método "get" del modelo, pasando la categoría como parámetro,
            // para obtener los menús que pertenecen a esa categoría
            $result = $menu->get($categoria);

            // Utiliza el método "toJSON" del objeto Response para formatear el resultado
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Método para obtener un producto por su ID
    public function getMenu($id)
    {
        try {
            // Crea un objeto Response, encargado de formatear la respuesta en JSON
            $response = new Response();

            // Crea una instancia del modelo MenuModel, que se encarga de 
            //interactuar con la base de datos
            $menu = new MenuModel();

            // Llama al método "get" del modelo, pasando el ID como parámetro,
            // para obtener el menú que corresponde a ese ID
            $result = $menu->get($id);

            // Utiliza el método "toJSON" del objeto Response para formatear el resultado
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
