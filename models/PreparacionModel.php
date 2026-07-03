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

    /* Crear Proceso de Preparación */
    public function create($data)
    {
        try {
            $ordenPaso = intval($data['OrdenPaso']);
            $tiempoEstimadoMinutos = isset($data['TiempoEstimadoMinutos']) ? intval($data['TiempoEstimadoMinutos']) : 'NULL';
            $idProducto = !empty($data['IdProducto']) ? intval($data['IdProducto']) : 'NULL';
            $idCombo = !empty($data['IdCombo']) ? intval($data['IdCombo']) : 'NULL';
            $idEstacion = intval($data['IdEstacion']);

            $sql = "INSERT INTO ProcesoPreparacion (OrdenPaso, TiempoEstimadoMinutos, IdProducto, IdCombo, IdEstacion) 
                    VALUES ($ordenPaso, $tiempoEstimadoMinutos, $idProducto, $idCombo, $idEstacion)";

            return $this->enlace->executeSQL_DML_last($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Actualizar Proceso de Preparación */
    public function update($id, $data)
    {
        try {
            $idProceso = intval($id);
            $ordenPaso = intval($data['OrdenPaso']);
            $tiempoEstimadoMinutos = isset($data['TiempoEstimadoMinutos']) ? intval($data['TiempoEstimadoMinutos']) : 'NULL';
            $idProducto = !empty($data['IdProducto']) ? intval($data['IdProducto']) : 'NULL';
            $idCombo = !empty($data['IdCombo']) ? intval($data['IdCombo']) : 'NULL';
            $idEstacion = intval($data['IdEstacion']);

            $sql = "UPDATE ProcesoPreparacion SET 
                        OrdenPaso = $ordenPaso, 
                        TiempoEstimadoMinutos = $tiempoEstimadoMinutos, 
                        IdProducto = $idProducto, 
                        IdCombo = $idCombo, 
                        IdEstacion = $idEstacion 
                    WHERE IdProceso = $idProceso";

            return $this->enlace->executeSQL_DML($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Eliminar Proceso de Preparación (Físico) */
    public function delete($id)
    {
        try {
            $idProceso = intval($id);
            $sql = "DELETE FROM ProcesoPreparacion WHERE IdProceso = $idProceso";

            return $this->enlace->executeSQL_DML($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
