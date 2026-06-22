<?php
class CategoriaModel
{
    public $enlace;

    // CORRECCIÓN: El constructor de PHP requiere doble guion bajo (__construct)
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* Listar todas las categorias activas */
    public function all()
    {
        try {
            $sql = "SELECT IdCategoria, Nombre FROM Categoria";

            // CORRECCIÓN: Faltaba ejecutar la consulta y retornar el resultado
            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Obtener una categoría en específico */
    public function get($id)
    {
        try {
            $sql = "SELECT IdCategoria, Nombre FROM Categoria";
            if ($id !== null) {
                // CORRECCIÓN: Se agregó un espacio antes del WHERE para evitar que se pegue con el texto de arriba
                $sql .= " WHERE IdCategoria = $id";
            }
            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Obtener los combos activos que pertenecen a una categoría específica */
    public function getCombosPorCategoria($idCategoria)
    {
        try {
            $sql = "SELECT 
                        cb.IdCombo,
                        cb.RutaImagen,
                        cb.Nombre,
                        cb.Descripcion,
                        cb.PrecioEspecial,
                        cb.Activo,
                        cb.IdCategoria
                    FROM Combo cb
                    WHERE cb.IdCategoria = $idCategoria AND cb.Activo = 1";

            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
