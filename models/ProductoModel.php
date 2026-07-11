<?php
class ProductoModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

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
                        pi.Imagen
                    FROM Producto p
                    LEFT JOIN Categoria c ON p.IdCategoria = c.IdCategoria
                    LEFT JOIN ProductoImagen pi ON p.IdProducto = pi.IdProducto AND pi.EsPrincipal = 1
                    GROUP BY p.IdProducto";

            $productos = $this->enlace->ExecuteSQL($sql);

            foreach ($productos as &$producto) {
                $producto->Ingredientes = $this->getIngredientesByProducto($producto->IdProducto);
            }

            return $productos;
        } catch (Exception $e) {
            handleException($e);
        }
    }

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
                    LEFT JOIN Categoria c ON p.IdCategoria = c.IdCategoria
                    LEFT JOIN ProductoImagen pi ON p.IdProducto = pi.IdProducto AND pi.EsPrincipal = 1
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

    public function getProductoCategoria($IdCategoria)
    {
        try {
            $sql = "SELECT * FROM Producto WHERE IdCategoria = $IdCategoria";
            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getIngredientesByProducto($idProducto)
    {
        try {
            $idProducto = intval($idProducto);
            $sql = "SELECT i.*
                    FROM Ingrediente i
                    INNER JOIN ProductoIngrediente pi ON pi.IdIngrediente = i.IdIngrediente
                    WHERE pi.IdProducto = $idProducto";

            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function create($data)
    {
        try {
            $nombre = addslashes($data['Nombre']);
            $descripcion = isset($data['Descripcion']) ? addslashes($data['Descripcion']) : null;
            $precio = floatval($data['Precio']);
            $idCategoria = intval($data['IdCategoria']);
            $activo = isset($data['Activo']) ? intval($data['Activo']) : 1;

            $sqlProducto = "INSERT INTO Producto (Nombre, Descripcion, Precio, Activo, IdCategoria) 
                            VALUES ('$nombre', " . ($descripcion ? "'$descripcion'" : "NULL") . ", $precio, $activo, $idCategoria)";

            $idNuevoProducto = $this->enlace->executeSQL_DML_last($sqlProducto);

            if ($idNuevoProducto) {
                if (!empty($data['Imagen'])) {
                    $imagen = addslashes($data['Imagen']);
                    $sqlImagen = "INSERT INTO ProductoImagen (Imagen, EsPrincipal, IdProducto) 
                                  VALUES ('$imagen', 1, $idNuevoProducto)";
                    $this->enlace->executeSQL_DML($sqlImagen);
                }

                if (!empty($data['Ingredientes']) && is_array($data['Ingredientes'])) {
                    foreach ($data['Ingredientes'] as $idIngrediente) {
                        $idIngrediente = intval($idIngrediente);
                        $sqlIngrediente = "INSERT INTO ProductoIngrediente (IdProducto, IdIngrediente) 
                                           VALUES ($idNuevoProducto, $idIngrediente)";
                        $this->enlace->executeSQL_DML($sqlIngrediente);
                    }
                }
            }

            return $idNuevoProducto;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function update($id, $data)
    {
        try {
            $id = intval($id);
            $nombre = addslashes($data['Nombre'] ?? '');
            $descripcion = isset($data['Descripcion']) ? addslashes($data['Descripcion']) : null;
            $precio = floatval($data['Precio'] ?? 0);
            $idCategoria = intval($data['IdCategoria'] ?? 0);
            $activo = isset($data['Activo']) ? intval($data['Activo']) : 1;

            $sqlProducto = "UPDATE Producto SET 
                                Nombre = '$nombre',
                                Descripcion = " . ($descripcion ? "'$descripcion'" : "NULL") . ",
                                Precio = $precio,
                                Activo = $activo,
                                IdCategoria = $idCategoria
                            WHERE IdProducto = $id";

            $resultado = $this->enlace->executeSQL_DML($sqlProducto);

            if (isset($data['Imagen'])) {
                $imagen = addslashes($data['Imagen']);
                $sqlCheck = "UPDATE ProductoImagen SET Imagen = '$imagen' 
                             WHERE IdProducto = $id AND EsPrincipal = 1";
                $filasAfectadas = $this->enlace->executeSQL_DML($sqlCheck);

                if ($filasAfectadas == 0) {
                    $sqlInsertImage = "INSERT INTO ProductoImagen (Imagen, EsPrincipal, IdProducto) 
                                       VALUES ('$imagen', 1, $id)";
                    $this->enlace->executeSQL_DML($sqlInsertImage);
                }
            }

            if (isset($data['Ingredientes']) && is_array($data['Ingredientes'])) {
                $sqlDelete = "DELETE FROM ProductoIngrediente WHERE IdProducto = $id";
                $this->enlace->executeSQL_DML($sqlDelete);

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

    /* Borrado Físico de la Base de Datos */
    public function delete($id)
    {
        try {
            $id = intval($id);
            
            $this->enlace->executeSQL_DML("DELETE FROM ProductoIngrediente WHERE IdProducto = $id");
            $this->enlace->executeSQL_DML("DELETE FROM ProductoImagen WHERE IdProducto = $id");
            
            $sql = "DELETE FROM Producto WHERE IdProducto = $id";
            $this->enlace->executeSQL_DML($sql);
            
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}