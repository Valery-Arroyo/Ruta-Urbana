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
                        GROUP_CONCAT(
                            DISTINCT md.DiaSemana
                            ORDER BY FIELD(
                                md.DiaSemana,
                                'Lunes',
                                'Martes',
                                'Miércoles',
                                'Jueves',
                                'Viernes',
                                'Sábado',
                                'Domingo'
                            )
                            SEPARATOR ', '
                        ) AS DiasDisponibles,
                        MIN(md.FechaInicio) AS FechaInicio,
                        MAX(md.FechaFin) AS FechaFin
                    FROM Menu m
                    LEFT JOIN MenuDisponibilidad md
                        ON m.IdMenu = md.IdMenu
                    GROUP BY
                        m.IdMenu,
                        m.Nombre,
                        m.EstaActivo,
                        m.HoraInicio,
                        m.HoraFin
                    ORDER BY 
                        m.EstaActivo DESC,
                        COALESCE(MAX(md.FechaInicio), '1900-01-01') DESC";

            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtener un menú completo por ID
     */
    public function get($id)
    {
        try {
            $idMenu = intval($id);

            /*
         * DATOS GENERALES DEL MENÚ
         */
            $sqlMenu = "SELECT
                        m.IdMenu,
                        m.Nombre,
                        m.HoraInicio,
                        m.HoraFin,
                        m.EstaActivo,

                        COALESCE(
                            GROUP_CONCAT(
                                DISTINCT md.DiaSemana
                                ORDER BY FIELD(
                                    md.DiaSemana,
                                    'Lunes',
                                    'Martes',
                                    'Miércoles',
                                    'Jueves',
                                    'Viernes',
                                    'Sábado',
                                    'Domingo'
                                )
                                SEPARATOR ', '
                            ),
                            ''
                        ) AS DiasDisponibles,

                        MIN(md.FechaInicio) AS FechaInicio,
                        MAX(md.FechaFin) AS FechaFin

                    FROM Menu m

                    LEFT JOIN MenuDisponibilidad md
                        ON m.IdMenu = md.IdMenu

                    WHERE m.IdMenu = $idMenu

                    GROUP BY
                        m.IdMenu,
                        m.Nombre,
                        m.HoraInicio,
                        m.HoraFin,
                        m.EstaActivo";

            $menu = $this->enlace->ExecuteSQL($sqlMenu);

            if (empty($menu)) {
                return null;
            }

            $resultado = $menu[0];

            /*
         * PRODUCTOS DEL MENÚ
         */
            $sqlProductos = "SELECT
                            p.IdProducto,
                            p.Nombre,
                            p.Descripcion,
                            p.Precio,
                            c.Nombre AS Categoria,
                            pi.Imagen AS ImagenProducto,
                            1 AS Cantidad

                        FROM MenuItem mi

                        INNER JOIN Producto p
                            ON p.IdProducto = mi.IdProducto

                        INNER JOIN Categoria c
                            ON c.IdCategoria = p.IdCategoria

                        LEFT JOIN ProductoImagen pi
                            ON pi.IdProducto = p.IdProducto
                           AND pi.EsPrincipal = 1

                        WHERE mi.IdMenu = $idMenu
                          AND mi.IdProducto IS NOT NULL

                        ORDER BY
                            c.Nombre,
                            p.Nombre";

            /*
         * COMBOS DEL MENÚ
         */
            $sqlCombos = "SELECT
                          cb.IdCombo,
                          cb.Nombre,
                          cb.Descripcion,
                          cb.PrecioEspecial AS Precio,
                          c.Nombre AS Categoria,
                          cb.RutaImagen AS ImagenCombo,
                          1 AS Cantidad

                      FROM MenuItem mi

                      INNER JOIN Combo cb
                          ON cb.IdCombo = mi.IdCombo

                      INNER JOIN Categoria c
                          ON c.IdCategoria = cb.IdCategoria

                      WHERE mi.IdMenu = $idMenu
                        AND mi.IdCombo IS NOT NULL

                      ORDER BY
                          c.Nombre,
                          cb.Nombre";

            $productos = $this->enlace->ExecuteSQL($sqlProductos);
            $combos = $this->enlace->ExecuteSQL($sqlCombos);

            $resultado->Productos = $productos ?: [];
            $resultado->Combos = $combos ?: [];

            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Crear menú
     */
    public function create($data)
    {
        try {
            $nombre = addslashes($data["Nombre"]);
            $horaInicio = addslashes($data["HoraInicio"]);
            $horaFin = addslashes($data["HoraFin"]);

            $estaActivo = isset($data["EstaActivo"])
                ? intval($data["EstaActivo"])
                : 1;

            $sqlMenu = "INSERT INTO Menu (
                            Nombre,
                            HoraInicio,
                            HoraFin,
                            EstaActivo
                        )
                        VALUES (
                            '$nombre',
                            '$horaInicio',
                            '$horaFin',
                            $estaActivo
                        )";

            $idMenu = $this->enlace->executeSQL_DML_last($sqlMenu);

            $this->insertarDisponibilidad($idMenu, $data);
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

            $estaActivo = isset($data["EstaActivo"])
                ? intval($data["EstaActivo"])
                : 1;

            $sqlMenu = "UPDATE Menu SET
                            Nombre = '$nombre',
                            HoraInicio = '$horaInicio',
                            HoraFin = '$horaFin',
                            EstaActivo = $estaActivo
                        WHERE IdMenu = $idMenu";

            $this->enlace->executeSQL_DML($sqlMenu);

            if (isset($data["Disponibilidad"])) {
                $this->enlace->executeSQL_DML(
                    "DELETE FROM MenuDisponibilidad
         WHERE IdMenu = $idMenu"
                );

                if (!empty($data["Disponibilidad"])) {
                    foreach ($data["Disponibilidad"] as $disp) {
                        if (empty($disp["DiaSemana"])) {
                            continue;
                        }

                        $fechaInicio = !empty($disp["FechaInicio"])
                            ? "'" . addslashes($disp["FechaInicio"]) . "'"
                            : "NULL";

                        $fechaFin = !empty($disp["FechaFin"])
                            ? "'" . addslashes($disp["FechaFin"]) . "'"
                            : "NULL";

                        $diaSemana = addslashes($disp["DiaSemana"]);

                        $sql = "INSERT INTO MenuDisponibilidad (
                        IdMenu,
                        FechaInicio,
                        FechaFin,
                        DiaSemana
                    )
                    VALUES (
                        $idMenu,
                        $fechaInicio,
                        $fechaFin,
                        '$diaSemana'
                    )";

                        $this->enlace->executeSQL_DML($sql);
                    }
                }
            }

            return true;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Borrar menú
     */
    public function delete($id)
    {
        try {
            $idMenu = intval($id);

            $this->enlace->executeSQL_DML(
                "DELETE FROM MenuDisponibilidad
                 WHERE IdMenu = $idMenu"
            );

            $this->enlace->executeSQL_DML(
                "DELETE FROM MenuItem
                 WHERE IdMenu = $idMenu"
            );

            return $this->enlace->executeSQL_DML(
                "DELETE FROM Menu
                 WHERE IdMenu = $idMenu"
            );
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Insertar disponibilidad del menú
     */
    private function insertarDisponibilidad($idMenu, $data)
    {
        if (empty($data["Disponibilidad"])) {
            return;
        }

        foreach ($data["Disponibilidad"] as $disp) {
            if (empty($disp["DiaSemana"])) {
                continue;
            }

            $fechaInicio = !empty($disp["FechaInicio"])
                ? "'" . addslashes($disp["FechaInicio"]) . "'"
                : "NULL";

            $fechaFin = !empty($disp["FechaFin"])
                ? "'" . addslashes($disp["FechaFin"]) . "'"
                : "NULL";

            $diaSemana = addslashes($disp["DiaSemana"]);

            $sql = "INSERT INTO MenuDisponibilidad (
                        IdMenu,
                        FechaInicio,
                        FechaFin,
                        DiaSemana
                    )
                    VALUES (
                        $idMenu,
                        $fechaInicio,
                        $fechaFin,
                        '$diaSemana'
                    )";

            $this->enlace->executeSQL_DML($sql);
        }
    }

    /**
     * Insertar productos y combos del menú
     */
    private function insertarItems($idMenu, $data)
    {
        /*
     * Usa Items si React lo envía.
     */
        if (!empty($data["Items"])) {
            foreach ($data["Items"] as $item) {
                $idProducto = !empty($item["IdProducto"])
                    ? intval($item["IdProducto"])
                    : "NULL";

                $idCombo = !empty($item["IdCombo"])
                    ? intval($item["IdCombo"])
                    : "NULL";

                if ($idProducto === "NULL" && $idCombo === "NULL") {
                    continue;
                }

                $sql = "INSERT INTO MenuItem (
                        IdMenu,
                        IdProducto,
                        IdCombo
                    )
                    VALUES (
                        $idMenu,
                        $idProducto,
                        $idCombo
                    )";

                $this->enlace->executeSQL_DML($sql);
            }

            return;
        }

        /*
     * Compatibilidad con Productos separados.
     */
        if (!empty($data["Productos"])) {
            foreach ($data["Productos"] as $producto) {
                if (empty($producto["IdProducto"])) {
                    continue;
                }

                $idProducto = intval($producto["IdProducto"]);

                $sql = "INSERT INTO MenuItem (
                        IdMenu,
                        IdProducto,
                        IdCombo
                    )
                    VALUES (
                        $idMenu,
                        $idProducto,
                        NULL
                    )";

                $this->enlace->executeSQL_DML($sql);
            }
        }

        /*
     * Compatibilidad con Combos separados.
     */
        if (!empty($data["Combos"])) {
            foreach ($data["Combos"] as $combo) {
                if (empty($combo["IdCombo"])) {
                    continue;
                }

                $idCombo = intval($combo["IdCombo"]);

                $sql = "INSERT INTO MenuItem (
                        IdMenu,
                        IdProducto,
                        IdCombo
                    )
                    VALUES (
                        $idMenu,
                        NULL,
                        $idCombo
                    )";

                $this->enlace->executeSQL_DML($sql);
            }
        }
    }
}
