<?php
class MenuModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Listar menús disponibles según el día y hora actual.
     * Incluye productos y combos agrupados.
     */
    public function all()
    {
        try {
            $sql = "SELECT 
                    m.IdMenu,
                    m.Nombre AS NombreMenu,
                    m.EstaActivo,
                    m.HoraInicio,
                    m.HoraFin
                FROM Menu m
                ORDER BY m.IdMenu DESC";

            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }



    /**
     * Obtener menús por categoría con validación de seguridad.
     */
    public function getMenuByCategoria($IdCategoria)
    {
        try {
            $sql = "SELECT * FROM Menu WHERE IdCategoria = ? AND EstaActivo = 1";
            return $this->enlace->ExecuteSQL($sql, [(int)$IdCategoria]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtener el detalle de un ítem (ya sea Combo o Producto individual).
     * Usa siempre parámetros bindeados, nunca concatenación directa de IDs.
     */
    public function getItemDetalle($id, $esCombo = true)
    {
        try {
            $idSeguro = (int)$id;

            if ($esCombo) {
                // Productos que componen un combo
                $sql = "SELECT c.Nombre, c.Descripcion, p.Nombre AS Componente, cp.Cantidad
                        FROM Combo c
                        JOIN ComboProducto cp ON c.IdCombo = cp.IdCombo
                        JOIN Producto p ON cp.IdProducto = p.IdProducto
                        WHERE c.IdCombo = ?";
            } else {
                // Detalle de un producto individual
                $sql = "SELECT Nombre, Descripcion, Precio 
                        FROM Producto 
                        WHERE IdProducto = ?";
            }

            return $this->enlace->ExecuteSQL($sql, [$idSeguro]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

/** 
     * Obtener los ítems de un menú con imágenes asociadas.
     */
    
    public function getMenuItemsConImagen($idMenu)
{
    try {
        $id = (int)$idMenu;

        $sql = "SELECT 
                    IFNULL(p.Nombre, cb.Nombre) AS NombreItem,
                    IFNULL(p.Descripcion, cb.Descripcion) AS Descripcion,
                    IFNULL(p.Precio, cb.PrecioEspecial) AS Precio,
                    c.Nombre AS Categoria,
                    -- Imagen principal del producto
                    pi.Imagen AS ImagenProducto,
                    -- Imagen del combo
                    cb.RutaImagen AS ImagenCombo
                FROM MenuItem mi
                LEFT JOIN Producto p ON mi.IdProducto = p.IdProducto
                LEFT JOIN ProductoImagen pi ON p.IdProducto = pi.IdProducto AND pi.EsPrincipal = 1
                LEFT JOIN Combo cb ON mi.IdCombo = cb.IdCombo
                LEFT JOIN Categoria c ON (p.IdCategoria = c.IdCategoria OR cb.IdCategoria = c.IdCategoria)
                WHERE mi.IdMenu = $id";

        return $this->enlace->ExecuteSQL($sql);
    } catch (Exception $e) {
        handleException($e);
    }
}

}
