<?php

/**
 * Clase encargada de gestionar la lógica de datos para los Combos.
 */
class ComboModel
{
    public $enlace;

    /**
     * Constructor de la clase.
     * Paso 1: Crea una nueva instancia de conexión a la base de datos MySQL.
     */
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Obtiene la lista completa de combos.
     * Paso 1: Define la consulta SQL seleccionando las columnas principales de la tabla 'Combo'.
     * Paso 2: Ejecuta la consulta a través del objeto de enlace.
     * Paso 3: Retorna el array de objetos con los resultados.
     */
    public function all()
    {
        try {
            $sql = "SELECT IdCombo, Nombre, Descripcion, PrecioEspecial, Activo, IdCategoria FROM Combo";
            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtiene la información de un combo específico por su ID.
     * Paso 1: Prepara la consulta base para seleccionar datos de 'Combo'.
     * Paso 2: Verifica si se recibió un ID; si existe, añade el filtro 'WHERE' a la consulta.
     * Paso 3: Envía la sentencia SQL final a la base de datos.
     * Paso 4: Retorna los datos del combo solicitado.
     */
    public function get($id)
    {
        try {
            $sql = "SELECT IdCombo, Nombre, Descripcion, PrecioEspecial, Activo, IdCategoria FROM Combo";

            if ($id !== null) {
                $sql .= " WHERE IdCombo = $id";
            }

            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Lista los combos que pertenecen a una categoría de productos específica.
     * Paso 1: Crea una consulta SQL que filtra registros basándose en el 'IdCategoria'.
     * Paso 2: Ejecuta la búsqueda en la base de datos.
     * Paso 3: Retorna todos los combos encontrados para esa categoría.
     */
    public function getComboCategoria($IdCategoria)
    {
        try {
            $sql = "SELECT * FROM Combo WHERE IdCategoria = $IdCategoria";
            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
