<?php
class Producto
{
    // Método para obtener todos los productos
    public function index()
    {
        // La clase Response en tu backend es una utilidad que se encarga de 
        // formatear y devolver las respuestas al cliente (frontend) de manera consistente.
        try {
            $response = new Response();
            $producto = new ProductoModel();
            $result = $producto->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Método para obtener productos por categoría
    public function get($categoria)
    {
        try {
            // Crea un objeto Response, encargado de formatear la respuesta en JSON
            $response = new Response();

            // Crea una instancia del modelo ProductoModel, que se encarga de 
            //interactuar con la base de datos
            $producto = new ProductoModel();

            // Llama al método "get" del modelo, pasando la categoría como parámetro,
            // para obtener los productos que pertenecen a esa categoría
            $result = $producto->get($categoria);

            // Utiliza el método "toJSON" del objeto Response para formatear el resultado
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Método para obtener un producto por su ID
    public function getProducto($id)
    {
        try {
            // Crea un objeto Response, encargado de formatear la respuesta en JSON
            $response = new Response();

            // Crea una instancia del modelo ProductoModel, que se encarga de 
            //interactuar con la base de datos
            $producto = new ProductoModel();

            // Llama al método "get" del modelo, pasando el ID como parámetro,
            // para obtener el producto que corresponde a ese ID
            $result = $producto->get($id);

            // Utiliza el método "toJSON" del objeto Response para formatear el resultado
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Método para obtener los ingredientes de un producto
    public function getIngredientes($idProducto)
    {
        try {
            $response = new Response();
            $producto = new ProductoModel();

            // Llamamos al nuevo método que definimos en el modelo
            $result = $producto->getIngredientesByProducto($idProducto);

            // Retornamos el resultado en formato JSON
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Método para obtener el producto del día
    public function productoDelDia()
    {
        try {
            $response = new Response();
            $producto = new ProductoModel();

            $result = $producto->productoDelDia();

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Método para crear un nuevo producto
    public function create()
    {
        try {
            AuthMiddleware::verificar(['Administrador']);

            $response = new Response();
            $producto = new ProductoModel();

            // Obtener datos del cuerpo de la petición
            $data = json_decode(file_get_contents("php://input"), true);

            $result = $producto->create($data);
            $response->toJSON(['id' => $result]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Método para actualizar un producto existente
    public function update($id)
    {
        try {
            AuthMiddleware::verificar(['Administrador']);

            $response = new Response();
            $producto = new ProductoModel();

            $data = json_decode(file_get_contents("php://input"), true);

            $result = $producto->update($id, $data);
            $response->toJSON(['success' => $result]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Método para realizar el borrado lógico de un producto
    public function delete($id)
    {
        try {
            AuthMiddleware::verificar(['Administrador']);

            $response = new Response();
            $producto = new ProductoModel();

            $result = $producto->delete($id);

            // Si $result es true, devolvemos success: 1
            $response->toJSON(['success' => $result ? 1 : 0]);
        } catch (Exception $e) {
            // Asegúrate de que esto no esté interrumpiendo el flujo
            handleException($e);
        }
    }

    // Subir la imagen de un producto (se usa desde el formulario de crear/editar)
    public function subirImagen()
    {
        try {
            AuthMiddleware::verificar(['Administrador']);

            $response = new Response();

            if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
                $response->status(400)->toJSON([], "No se recibió ninguna imagen válida");
                return;
            }

            $archivo = $_FILES['imagen'];
            $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
            $extensionesPermitidas = ['jpg', 'jpeg', 'png', 'webp'];

            if (!in_array($extension, $extensionesPermitidas)) {
                $response->status(400)->toJSON([], "Formato de imagen no permitido. Use jpg, png o webp");
                return;
            }

            if ($archivo['size'] > 5 * 1024 * 1024) {
                $response->status(400)->toJSON([], "La imagen no debe superar los 5MB");
                return;
            }

            $carpetaDestino = __DIR__ . "/../uploads/ImagenesRutaUrbana/";
            if (!is_dir($carpetaDestino)) {
                mkdir($carpetaDestino, 0755, true);
            }

            $nombreArchivo = "producto_" . uniqid() . "." . $extension;

            if (!move_uploaded_file($archivo['tmp_name'], $carpetaDestino . $nombreArchivo)) {
                $response->status(500)->toJSON([], "No se pudo guardar la imagen");
                return;
            }

            $response->toJSON(['ruta' => "uploads/ImagenesRutaUrbana/" . $nombreArchivo]);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
