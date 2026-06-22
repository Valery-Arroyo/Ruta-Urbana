<?php
class ComboModel
{
    public $enlace;

    public function __construct()
    {
        // En el constructor de la clase ComboModel, se establece una conexión a la base de datos
        $this->enlace = new MySqlConnect();
    }

    public function all()
    {
        try {
            $sql = "SELECT 
                    c.IdCombo,
                    c.Nombre AS NombreCombo,
                    c.Descripcion,
                    c.PrecioEspecial,
                    c.Activo,
                    c.IdCategoria,
                    cat.Nombre AS NombreCategoria,
                    c.RutaImagen,

                    p.IdProducto,
                    p.Nombre AS NombreProducto,
                    p.Descripcion AS DescripcionProducto,
                    cp.Cantidad

                FROM Combo c
                INNER JOIN Categoria cat 
                    ON c.IdCategoria = cat.IdCategoria

                INNER JOIN ComboProducto cp 
                    ON c.IdCombo = cp.IdCombo

                INNER JOIN Producto p 
                    ON cp.IdProducto = p.IdProducto

                WHERE c.Activo = 1";

            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }


    /* Obtener un combo específico con el detalle de sus productos asociados */
    public function get($id)
    {
        try {
            $sql = "SELECT 
                   c.IdCombo,
                   c.Nombre AS NombreCombo,
                   c.Descripcion AS DescripcionCombo,
                   c.PrecioEspecial,
                   c.Activo,
                   c.IdCategoria,
                   cat.Nombre AS NombreCategoria,   
                   c.RutaImagen,
                   cp.Cantidad,
                   p.IdProducto,
                   p.Nombre AS NombreProducto,
                   p.Precio AS PrecioIndividual
                FROM Combo c
                INNER JOIN Categoria cat ON c.IdCategoria = cat.IdCategoria
                INNER JOIN ComboProducto cp ON c.IdCombo = cp.IdCombo
                INNER JOIN Producto p ON cp.IdProducto = p.IdProducto";

            if ($id !== null) {
                $sql .= " WHERE c.IdCombo = $id";
            }

            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Obtener los combos que pertenecen a una categoría específica (ej: Categoría 5 - Combos) */
    public function getComboCategoria($IdCategoria)
    {
        try {
            $sql = "SELECT * FROM Combo WHERE IdCategoria = $IdCategoria";

            // Ejecuta la consulta SQL y devuelve el resultado
            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
