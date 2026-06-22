<?php
class Categoria
{

    //Método para obtener todas las categorias
    public function index()
    {

        try {

            //La clase Response en tu backend es una utilidad que se encarga de 
            // formatear y devolver las respuestas al cliente (frontend) de manera consistente.
            $response = new Response();

            //Crea una instancia del modelo CategoriaModel,
            //que se encarga de interactuar con la base de datos
            $categoria = new CategoriaModel();

            $result = $categoria->all();
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function get($categoria)
    {
        try {
            // Crea un objeto Response, encargado de formatear la respuesta en JSON
            $response = new Response();

            // Crea una instancia del modelo CategoriaModel, que se encarga de 
            // interactuar con la base de datos
            $categoriaModel = new CategoriaModel();

            // Llama al método "getCombosPorCategoria" del modelo, pasando el ID de la categoría,
            // para obtener los combos activos que pertenecen a ella
            $result = $categoriaModel->getCombosPorCategoria($categoria);

            // Utiliza el método "toJSON" del objeto Response para formatear el resultado
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }


    public function getCategoria($id)
    {

        try {

            // Crea un objeto Response, encargado de formatear la respuesta en JSON
            $response = new Response();

            $categoria = new CategoriaModel();

            $result = $categoria->get($id);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
