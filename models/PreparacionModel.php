<?php
class PreparacionModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* Listar todos los procesos de preparación registrados */
    public function all()
    {
        try {
            // INCLUSIÓN DE pp.IdProducto Y pp.IdCombo EN EL SELECT
            $sql = "SELECT 
                        pp.IdProducto,
                        pp.IdCombo,
                        p.Nombre AS NombreProducto,
                        c.Nombre AS NombreCombo,
                        pp.OrdenPaso,
                        e.Nombre AS NombreEstacion,
                        pp.TiempoEstimadoMinutos
                    FROM ProcesoPreparacion pp
                    LEFT JOIN Producto p ON pp.IdProducto = p.IdProducto
                    LEFT JOIN Combo c ON pp.IdCombo = c.IdCombo
                    INNER JOIN Estacion e ON pp.IdEstacion = e.IdEstacion
                    ORDER BY pp.IdProducto ASC, pp.IdCombo ASC, pp.OrdenPaso ASC";

            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Obtener el detalle del proceso de preparación de un producto específico */
    public function get($idProducto)
    {
        try {
            $idProducto = intval($idProducto);

            $sql = "SELECT 
                        pp.IdProducto,
                        p.Nombre AS NombreProducto,
                        pp.OrdenPaso,
                        e.Nombre AS NombreEstacion,
                        pp.TiempoEstimadoMinutos
                    FROM ProcesoPreparacion pp
                    INNER JOIN Producto p ON pp.IdProducto = p.IdProducto
                    INNER JOIN Estacion e ON pp.IdEstacion = e.IdEstacion
                    WHERE pp.IdProducto = $idProducto
                    ORDER BY pp.OrdenPaso ASC";

            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Obtener el detalle del proceso de preparación de un combo específico */
    public function getProcesoCombo($idCombo)
    {
        try {
            $idCombo = intval($idCombo);

            $sql = "SELECT 
                        pp.IdCombo,
                        c.Nombre AS NombreCombo,
                        pp.OrdenPaso,
                        e.Nombre AS NombreEstacion,
                        pp.TiempoEstimadoMinutos
                    FROM ProcesoPreparacion pp
                    INNER JOIN Combo c ON pp.IdCombo = c.IdCombo
                    INNER JOIN Estacion e ON pp.IdEstacion = e.IdEstacion
                    WHERE pp.IdCombo = $idCombo
                    ORDER BY pp.OrdenPaso ASC";

            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
