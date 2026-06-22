<?php
class MenuModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Listar menús
     * Ordenado por el más reciente (descendente)
     */
    public function all()
    {
        try {
            $sql = "SELECT 
                    m.IdMenu,
                    m.Nombre,
                    m.EstaActivo,
                    m.HoraInicio,
                    m.HoraFin,
                    md.FechaInicio,
                    md.FechaFin,
                    md.DiaSemana
                FROM Menu m
                LEFT JOIN MenuDisponibilidad md 
                    ON md.IdMenu = m.IdMenu
                    AND md.FechaInicio = (
                        SELECT MAX(md2.FechaInicio)
                        FROM MenuDisponibilidad md2
                        WHERE md2.IdMenu = m.IdMenu
                    )
                ORDER BY 
                    m.EstaActivo DESC,
                    md.FechaInicio DESC,
                    m.HoraInicio DESC";

            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtener menús por categoría
     */
    public function getMenuByCategoria($IdCategoria)
    {
        try {
            $sql = "SELECT * 
                    FROM Menu 
                    WHERE IdCategoria = ? 
                    AND EstaActivo = 1";

            return $this->enlace->ExecuteSQL($sql, [(int)$IdCategoria]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Detalle de producto o combo
     */
    public function getItemDetalle($id, $esCombo = true)
    {
        try {
            $idSeguro = (int)$id;

            if ($esCombo) {
                $sql = "SELECT 
                            c.Nombre,
                            c.Descripcion,
                            p.Nombre AS Componente,
                            cp.Cantidad
                        FROM Combo c
                        INNER JOIN ComboProducto cp ON c.IdCombo = cp.IdCombo
                        INNER JOIN Producto p ON cp.IdProducto = p.IdProducto
                        WHERE c.IdCombo = ?";
            } else {
                $sql = "SELECT 
                            Nombre,
                            Descripcion,
                            Precio 
                        FROM Producto 
                        WHERE IdProducto = ?";
            }

            return $this->enlace->ExecuteSQL($sql, [$idSeguro]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Ítems de un menú con imágenes
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
                        pi.Imagen AS ImagenProducto,
                        cb.RutaImagen AS ImagenCombo
                    FROM MenuItem mi
                    LEFT JOIN Producto p 
                        ON mi.IdProducto = p.IdProducto
                    LEFT JOIN ProductoImagen pi 
                        ON p.IdProducto = pi.IdProducto 
                        AND pi.EsPrincipal = 1
                    LEFT JOIN Combo cb 
                        ON mi.IdCombo = cb.IdCombo
                    LEFT JOIN Categoria c 
                        ON (p.IdCategoria = c.IdCategoria 
                        OR cb.IdCategoria = c.IdCategoria)
                    WHERE mi.IdMenu = $id";

            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
