<?php
class ProductoModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /*Listar */
    public function all()
    {
        try {
            $sql = "SELECT 
    p.IdProducto,
    p.Nombre,
    p.Descripcion,
    p.Precio,
    p.Activo,
    p.IdCategoria,
    GROUP_CONCAT(pi.Imagen) AS Imagenes
    FROM Producto p
    LEFT JOIN ProductoImagen pi 
    ON p.IdProducto = pi.IdProducto
    GROUP BY p.IdProducto";

            $productos = $this->enlace->ExecuteSQL($sql);

            foreach ($productos as &$producto) {
                $producto->Ingredientes =
                    $this->getIngredientesByProducto($producto->IdProducto);
            }

            return $productos;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /*Obtener */
    public function get($id)
    {
        try {
            $sql = "SELECT 
            p.IdProducto,
            p.Nombre,
            p.Descripcion,
            p.Precio,
            p.Activo,
            c.Nombre AS NombreCategoria,
            pi.Imagen
        FROM Producto p
        LEFT JOIN Categoria c
            ON p.IdCategoria = c.IdCategoria
        LEFT JOIN ProductoImagen pi
            ON p.IdProducto = pi.IdProducto
            AND pi.EsPrincipal = 1
        WHERE p.IdProducto = $id";

            $resultado = $this->enlace->ExecuteSQL($sql);

            if (!empty($resultado) && isset($resultado[0])) {
                $resultado[0]->Ingredientes = $this->getIngredientesByProducto($id);
            }


            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /*Obtener los productos de una categoria */
    public function getProductoCategoria($IdCategoria)
    {
        try {
            //Consulta SQL
            $sql = "SELECT * FROM Producto WHERE IdCategoria = $IdCategoria";
            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Obtener ingredientes de un producto específico */
    public function getIngredientesByProducto($idProducto)
    {
        try {
            $idProducto = intval($idProducto);

            $sql = "SELECT i.*
                FROM Ingrediente i
                INNER JOIN ProductoIngrediente pi
                    ON pi.IdIngrediente = i.IdIngrediente
                WHERE pi.IdProducto = $idProducto";

            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Crear Producto */
    public function create($data)
    {
        try {
            /* Acá obtenemos todas las variables para poder meterlas en el nuevo producto */
            $nombre = addslashes($data['Nombre']);
            $descripcion = isset($data['Descripcion']) ? addslashes($data['Descripcion']) : null;
            $precio = floatval($data['Precio']);
            $idCategoria = intval($data['IdCategoria']);
            $activo = isset($data['Activo']) ? intval($data['Activo']) : 1;

            /* Insertar el producto usando el método para obtener el ID generado */
            $sqlProducto = "INSERT INTO Producto (Nombre, Descripcion, Precio, Activo, IdCategoria) 
                            VALUES ('$nombre', " . ($descripcion ? "'$descripcion'" : "NULL") . ", $precio, $activo, $idCategoria)";

            /* Ejecuta la consulta y define la variable */
            $idNuevoProducto = $this->enlace->executeSQL_DML_last($sqlProducto);

            if ($idNuevoProducto) {
                /* Insertar la imagen en ProductoImagen vinculada al ID recién creado */
                if (!empty($data['Imagen'])) {
                    $imagen = addslashes($data['Imagen']);
                    $sqlImagen = "INSERT INTO ProductoImagen (Imagen, EsPrincipal, IdProducto) 
                                  VALUES ('$imagen', 1, $idNuevoProducto)";
                    $this->enlace->executeSQL_DML($sqlImagen);
                }

                /* Insertar la asociación en ProductoIngrediente */
                if (!empty($data['Ingredientes']) && is_array($data['Ingredientes'])) {
                    foreach ($data['Ingredientes'] as $idIngrediente) {
                        $idIngrediente = intval($idIngrediente);
                        $sqlIngrediente = "INSERT INTO ProductoIngrediente (IdProducto, IdIngrediente) 
                                           VALUES ($idNuevoProducto, $idIngrediente)";
                        $this->enlace->executeSQL_DML($sqlIngrediente);
                    }
                }
            }

            /* Devolvemos el producto nuevo totalmente completo */
            return $idNuevoProducto;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Actualizar Producto */
    public function update($id, $data)
    {
        try {
            // Convertir el ID a entero para mayor seguridad ya que viene de la URL
            // y normalmente es un string. Esto previene errores.
            $id = intval($id);
            // Proteger los datos de entrada para evitar inyecciones SQL, básicamente 
            // mantiene los caracteres especiales que puede contener el nombre y la descripción, como comillas simples o dobles.
            $nombre = addslashes($data['Nombre']);
            // Manejar la descripción que puede ser nula
            $descripcion = isset($data['Descripcion']) ? addslashes($data['Descripcion']) : null;
            // Convertir el precio a float y la categoría a entero
            $precio = floatval($data['Precio']);
            $idCategoria = intval($data['IdCategoria']);
            // Convertir el estado activo a entero, por defecto 1 (activo)
            $activo = isset($data['Activo']) ? intval($data['Activo']) : 1;


            // 1. Actualizar datos del producto
            $sqlProducto = "UPDATE Producto SET 
                        Nombre = '$nombre',
                        Descripcion = " . ($descripcion ? "'$descripcion'" : "NULL") . ",
                        Precio = $precio,
                        Activo = $activo,
                        IdCategoria = $idCategoria
                    WHERE IdProducto = $id";

            $resultado = $this->enlace->executeSQL_DML($sqlProducto);



            // 2. Actualizar o insertar imagen principal
            // isset sirve para verificar si la clave 'Imagen' existe en el array $data 
            // y !empty verifica que no esté vacía. Esto asegura que solo se procese la imagen si realmente se ha proporcionado.
            if (isset($data['Imagen']) && !empty($data['Imagen'])) {

                $imagen = addslashes($data['Imagen']);

                // Verificar si ya existe una imagen principal
                $sqlBuscarImagen = "SELECT IdImagen 
                                FROM ProductoImagen
                                WHERE IdProducto = $id 
                                AND EsPrincipal = 1";

                $imagenExiste = $this->enlace->ExecuteSQL($sqlBuscarImagen);


                if (!empty($imagenExiste)) {

                    // Actualizar imagen existente
                    $sqlUpdateImagen = "UPDATE ProductoImagen 
                                    SET Imagen = '$imagen'
                                    WHERE IdProducto = $id
                                    AND EsPrincipal = 1";

                    $this->enlace->executeSQL_DML($sqlUpdateImagen);
                } else {

                    // Crear imagen si no existe
                    $sqlInsertImagen = "INSERT INTO ProductoImagen
                                    (Imagen, EsPrincipal, IdProducto)
                                    VALUES ('$imagen', 1, $id)";

                    $this->enlace->executeSQL_DML($sqlInsertImagen);
                }
            }



            // 3. Actualizar ingredientes asociados
            if (isset($data['Ingredientes']) && is_array($data['Ingredientes'])) {


                // Eliminar ingredientes anteriores
                $sqlDeleteIngredientes = "DELETE FROM ProductoIngrediente
                                      WHERE IdProducto = $id";

                $this->enlace->executeSQL_DML($sqlDeleteIngredientes);

                // Insertar nuevos ingredientes
                foreach ($data['Ingredientes'] as $idIngrediente) {

                    $idIngrediente = intval($idIngrediente);

                    $sqlIngrediente = "INSERT INTO ProductoIngrediente
                                   (IdProducto, IdIngrediente)
                                   VALUES ($id, $idIngrediente)";

                    $this->enlace->executeSQL_DML($sqlIngrediente);
                }
            }
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Eliminar un producto 
    public function delete($id)
    {
        try {
            // Convertir el ID a entero para mayor seguridad
            $id = intval($id);

            // Primero se eliminan las relaciones en ProductoIngrediente y ProductoImagen
            $this->enlace->executeSQL_DML(
                "DELETE FROM ProductoIngrediente 
             WHERE IdProducto = $id"
            );

            // Luego se eliminan las imágenes asociadas al producto
            $this->enlace->executeSQL_DML(
                "DELETE FROM ProductoImagen 
             WHERE IdProducto = $id"
            );

            // Finalmente, se elimina el producto en sí
            return $this->enlace->executeSQL_DML(
                "DELETE FROM Producto 
             WHERE IdProducto = $id"
            );
        } catch (Exception $e) {

            handleException($e);
        }
    }
}
