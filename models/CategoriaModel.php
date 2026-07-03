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

    /* Crear Categoría */
    public function create($data)
    {
        try {
            $nombre = addslashes($data['Nombre']);

            $sql = "INSERT INTO Categoria (Nombre) VALUES ('$nombre')";

            return $this->enlace->executeSQL_DML_last($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Actualizar Categoría */
    public function update($id, $data)
    {
        try {
            $idCategoria = intval($id);
            $nombre = addslashes($data['Nombre']);

            $sql = "UPDATE Categoria SET Nombre = '$nombre' WHERE IdCategoria = $idCategoria";

            return $this->enlace->executeSQL_DML($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Eliminar Categoría (Borrado Físico) */
    public function delete($id)
    {
        try {
            $idCategoria = intval($id);
            $sql = "DELETE FROM Categoria WHERE IdCategoria = $idCategoria";

            return $this->enlace->executeSQL_DML($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}