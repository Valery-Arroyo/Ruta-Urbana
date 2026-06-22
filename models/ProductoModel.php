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
}
