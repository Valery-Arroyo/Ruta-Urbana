<?php
class MenuModel
{
    public $enlace;

    public function __construct()
    {
        // En el constructor de la clase MenuModel, se establece una conexión a la base de datos
        $this->enlace = new MySqlConnect();
    }

    /* Listar todos los menús activos */
    public function all()
    {
        try {
            $sql = "SELECT 
                        IdMenu,
                        Nombre,
                        Descripcion,
                        PrecioEspecial,
                        Activo,
                        IdCategoria
                    FROM Menu 
                    WHERE Activo = 1";

            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Obtener un menú específico con el detalle de sus productos asociados
    public function get($id)
    {
        try {
            // Consulta SQL
            $sql = "SELECT 
                    c.IdMenu,
                    c.Nombre AS NombreMenu,
                    c.Descripcion AS DescripcionMenu,
                    c.PrecioEspecial,
                    c.Activo,
                    c.IdCategoria,
                    cp.Cantidad,
                    p.IdProducto,
                    p.Nombre AS NombreProducto,
                    p.Precio AS PrecioIndividual
                FROM Combo c
                // Se unen las tablas Combo, ComboProducto y Producto para obtener los detalles del menú
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

    // Obtener los combos que pertenecen a una categoría específica
    public function getMenuCategoria($IdCategoria)
    {
        try {
            // Consulta SQL para obtener los menús de una categoría específica
            $sql = "SELECT * FROM Menu WHERE IdCategoria = $IdCategoria";

            // Ejecuta la consulta SQL y devuelve el resultado
            $resultado = $this->enlace->ExecuteSQL($sql);

            // Devuelve el resultado de la consulta
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
