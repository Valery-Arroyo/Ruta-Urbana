<?php
class IngredienteModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* Listar todos los ingredientes */
    public function all()
    {
        try {
            $sql = "SELECT IdIngrediente, Nombre FROM Ingrediente";

            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Obtener un ingrediente específico */
    public function get($id)
    {
        try {
            $sql = "SELECT IdIngrediente, Nombre FROM Ingrediente";

            if ($id !== null) {
                $sql .= " WHERE IdIngrediente = $id";
            }

            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Crear ingrediente */
    public function create($data)
    {
        try {
            $nombre = addslashes($data['Nombre']);

            $sql = "INSERT INTO Ingrediente (Nombre) 
                    VALUES ('$nombre')";

            return $this->enlace->executeSQL_DML_last($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Actualizar ingrediente */
    public function update($id, $data)
    {
        try {
            $idIngrediente = intval($id);
            // Convierte todas las claves a minúsculas
            $data = array_change_key_case($data, CASE_LOWER);

            $nombre = isset($data['nombre']) ? addslashes($data['nombre']) : null;

            if ($nombre === null) {
                throw new Exception("Campo 'Nombre' requerido");
            }

            $sql = "UPDATE Ingrediente 
                SET Nombre = '$nombre'
                WHERE IdIngrediente = $idIngrediente";

            return $this->enlace->executeSQL_DML($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }




    /* Eliminar ingrediente */
    public function delete($id)
    {
        try {
            $idIngrediente = intval($id);

            $sql = "DELETE FROM Ingrediente 
                    WHERE IdIngrediente = $idIngrediente";

            return $this->enlace->executeSQL_DML($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
