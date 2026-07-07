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
            c.Nombre AS NombreCategoria,
            pi.IdImagen,
            pi.Imagen
            FROM Producto p
            LEFT JOIN Categoria c
            ON p.IdCategoria = c.IdCategoria
            LEFT JOIN ProductoImagen pi
            ON p.IdProducto = pi.IdProducto
            AND pi.EsPrincipal = 1";

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
            $id = intval($id);
            $nombre = addslashes($data['Nombre']);
            $descripcion = isset($data['Descripcion']) ? addslashes($data['Descripcion']) : null;
            $precio = floatval($data['Precio']);
            $idCategoria = intval($data['IdCategoria']);
            $activo = isset($data['Activo']) ? intval($data['Activo']) : 1;

            // 1. Actualizar los datos de la tabla Producto
            $sqlProducto = "UPDATE Producto SET 
                        Nombre = '$nombre', 
                        Descripcion = " . ($descripcion ? "'$descripcion'" : "NULL") . ", 
                        Precio = $precio, 
                        Activo = $activo, 
                        IdCategoria = $idCategoria 
                    WHERE IdProducto = $id";

            $resultado = $this->enlace->executeSQL_DML($sqlProducto);

            // 2. Actualizar o Insertar la Imagen Principal
            if (isset($data['Imagen'])) {
                $imagen = addslashes($data['Imagen']);

                // Primero intentamos actualizar si ya existe una imagen registrada como principal
                $sqlCheck = "UPDATE ProductoImagen SET Imagen = '$imagen' 
                             WHERE IdProducto = $id AND EsPrincipal = 1";
                $filasAfectadas = $this->enlace->executeSQL_DML($sqlCheck);

                // Si no se afectó ninguna fila (porque no tenía imagen previa), la insertamos de cero
                if ($filasAfectadas == 0) {
                    $sqlInsertImage = "INSERT INTO ProductoImagen (Imagen, EsPrincipal, IdProducto) 
                                       VALUES ('$imagen', 1, $id)";
                    $this->enlace->executeSQL_DML($sqlInsertImage);
                }
            }

            // 3. Sincronizar los ingredientes en la tabla intermedia
            if (isset($data['Ingredientes']) && is_array($data['Ingredientes'])) {
                // Se eliminan las relaciones pasadas
                $sqlDelete = "DELETE FROM ProductoIngrediente WHERE IdProducto = $id";
                $this->enlace->executeSQL_DML($sqlDelete);

                // Se insertan las nuevas seleccionadas
                foreach ($data['Ingredientes'] as $idIngrediente) {
                    $idIngrediente = intval($idIngrediente);
                    $sqlIngrediente = "INSERT INTO ProductoIngrediente (IdProducto, IdIngrediente) 
                                       VALUES ($id, $idIngrediente)";
                    $this->enlace->executeSQL_DML($sqlIngrediente);
                }
            }

            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Borrado Lógico (Inhabilitar Producto) */
    public function delete($id)
    {
        try {
            $id = intval($id);
            $sql = "UPDATE Producto SET Activo = 0 WHERE IdProducto = $id";

            return $this->enlace->executeSQL_DML($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
