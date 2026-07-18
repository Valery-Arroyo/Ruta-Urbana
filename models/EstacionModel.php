<?php
class EstacionModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* Listar todas las estaciones */
    public function all()
    {
        try {
            $sql = "SELECT IdEstacion, Nombre, Descripcion FROM Estacion ORDER BY Nombre ASC";
            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}