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
                    pi.Imagen
                FROM Producto p
                LEFT JOIN ProductoImagen pi
                    ON p.IdProducto = pi.IdProducto
                    AND pi.EsPrincipal = 1";

            $resultado = $this->enlace->ExecuteSQL($sql);

            return $resultado;
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
                        p.IdCategoria,
                        i.IdImagen,
                        i.Imagen,
                        i.EsPrincipal
                    FROM Producto p
                    LEFT JOIN ProductoImagen i 
                        ON p.IdProducto = i.IdProducto";

            if ($id !== null) {
                $sql .= " WHERE p.IdProducto = $id";
            }

            $resultado = $this->enlace->ExecuteSQL($sql);
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
            $sql = "SELECT 
                    i.IdIngrediente, 
                    i.Nombre, 
                    i.Descripcion 
                FROM Ingrediente i
                INNER JOIN ProductoIngrediente pi 
                    ON i.IdIngrediente = pi.IdIngrediente
                WHERE pi.IdProducto = " . intval($idProducto);

            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
