<?php
class Categoria
{

    //Método para obtener todas las categorias
    public function index()
    {
        try {

            $response = new Response();

            $categoria = new CategoriaModel();

            $result = $categoria->all();

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

    // Crear una nueva Categoría
    public function createCategoria()
    {
        try {
            $response = new Response();
            $categoria = new CategoriaModel();

            $data = json_decode(file_get_contents("php://input"), true);

            $result = $categoria->create($data);
            $response->toJSON(['id' => $result]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Actualizar una Categoría existente
    public function updateCategoria($id)
    {
        try {
            $response = new Response();
            $categoria = new CategoriaModel();

            $data = json_decode(file_get_contents("php://input"), true);

            $result = $categoria->update($id, $data);
            $response->toJSON(['success' => $result]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Eliminar una Categoría
    public function deleteCategoria($id)
    {
        try {
            $response = new Response();
            $categoria = new CategoriaModel();

            $result = $categoria->delete($id);
            $response->toJSON(['success' => $result]);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
