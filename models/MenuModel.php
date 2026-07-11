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
                        GROUP_CONCAT(DISTINCT md.DiaSemana ORDER BY md.DiaSemana SEPARATOR ', ') AS DiasDisponibles,
                        MAX(md.FechaInicio) AS FechaMax
                    FROM Menu m
                    LEFT JOIN MenuDisponibilidad md ON m.IdMenu = md.IdMenu
                    GROUP BY m.IdMenu, m.Nombre, m.EstaActivo, m.HoraInicio, m.HoraFin
                    ORDER BY 
                        m.EstaActivo DESC, 
                        COALESCE(MAX(md.FechaInicio), '1900-01-01') DESC";

            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // ... [Mantén los métodos getMenuByCategoria y get tal cual estaban] ...

    /**
     * Crear menú
     */
    public function create($data)
    {
        try {
            $nombre = addslashes($data["Nombre"]);
            $horaInicio = addslashes($data["HoraInicio"]);
            $horaFin = addslashes($data["HoraFin"]);
            $estaActivo = isset($data["EstaActivo"]) ? intval($data["EstaActivo"]) : 1;

            $sqlMenu = "INSERT INTO Menu (Nombre, HoraInicio, HoraFin, EstaActivo) 
                        VALUES ('$nombre', '$horaInicio', '$horaFin', $estaActivo)";
            $idMenu = $this->enlace->executeSQL_DML_last($sqlMenu);

            // Disponibilidad
            if (!empty($data["Disponibilidad"])) {
                foreach ($data["Disponibilidad"] as $disp) {
                    if (empty($disp["DiaSemana"])) continue;
                    $fechaInicio = !empty($disp["FechaInicio"]) ? "'" . addslashes($disp["FechaInicio"]) . "'" : "NULL";
                    $fechaFin = !empty($disp["FechaFin"]) ? "'" . addslashes($disp["FechaFin"]) . "'" : "NULL";
                    $dia = "'" . addslashes($disp["DiaSemana"]) . "'";
                    $sql = "INSERT INTO MenuDisponibilidad (IdMenu, FechaInicio, FechaFin, DiaSemana) 
                            VALUES ($idMenu, $fechaInicio, $fechaFin, $dia)";
                    $this->enlace->executeSQL_DML($sql);
                }
            }

            // Productos y Combos (Lógica simplificada)
            $this->insertarItems($idMenu, $data);
            
            return $idMenu;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Actualizar menú
     */
    public function update($id, $data)
    {
        try {
            $idMenu = intval($id);
            $nombre = addslashes($data["Nombre"]);
            $horaInicio = addslashes($data["HoraInicio"]);
            $horaFin = addslashes($data["HoraFin"]);
            $estaActivo = isset($data["EstaActivo"]) ? intval($data["EstaActivo"]) : 1;

            $sqlMenu = "UPDATE Menu SET 
                            Nombre = '$nombre', 
                            HoraInicio = '$horaInicio', 
                            HoraFin = '$horaFin', 
                            EstaActivo = $estaActivo 
                        WHERE IdMenu = $idMenu";
            $this->enlace->executeSQL_DML($sqlMenu);

            // Limpieza y reinserción
            if (isset($data["Disponibilidad"])) {
                $this->enlace->executeSQL_DML("DELETE FROM MenuDisponibilidad WHERE IdMenu = $idMenu");
                // ... [Reinsertar disponibilidad igual que en create] ...
            }

            if (isset($data["Productos"]) || isset($data["Combos"])) {
                $this->enlace->executeSQL_DML("DELETE FROM MenuItem WHERE IdMenu = $idMenu");
                $this->insertarItems($idMenu, $data);
            }

            return true;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Borrar un Menú
     */
    public function delete($id)
    {
        try {
            $idMenu = intval($id);
            $this->enlace->executeSQL_DML("DELETE FROM MenuDisponibilidad WHERE IdMenu = $idMenu");
            $this->enlace->executeSQL_DML("DELETE FROM MenuItem WHERE IdMenu = $idMenu");
            return $this->enlace->executeSQL_DML("DELETE FROM Menu WHERE IdMenu = $idMenu");
        } catch (Exception $e) {
            handleException($e);
        }
    }

    private function insertarItems($idMenu, $data) {
        // Lógica común para insertar productos y combos en MenuItem
        if (!empty($data["Productos"])) {
            foreach ($data["Productos"] as $p) {
                $this->enlace->executeSQL_DML("INSERT INTO MenuItem (IdMenu, IdProducto, IdCombo) VALUES ($idMenu, " . intval($p["IdProducto"]) . ", NULL)");
            }
        }
        if (!empty($data["Combos"])) {
            foreach ($data["Combos"] as $c) {
                $this->enlace->executeSQL_DML("INSERT INTO MenuItem (IdMenu, IdProducto, IdCombo) VALUES ($idMenu, NULL, " . intval($c["IdCombo"]) . ")");
            }
        }
    }
}