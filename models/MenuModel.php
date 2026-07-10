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
                            SEPARATOR ', '
                        ) AS DiasDisponibles

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
                        m.IdMenu DESC";


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

            $IdCategoria = intval($IdCategoria);


            $sql = "SELECT DISTINCT

                        m.IdMenu,
                        m.Nombre,
                        m.HoraInicio,
                        m.HoraFin,
                        m.EstaActivo

                    FROM Menu m


                    INNER JOIN MenuItem mi
                        ON m.IdMenu = mi.IdMenu


                    LEFT JOIN Producto p
                        ON mi.IdProducto = p.IdProducto


                    LEFT JOIN Combo c
                        ON mi.IdCombo = c.IdCombo


                    WHERE

                    (
                        p.IdCategoria = $IdCategoria

                        OR

                        c.IdCategoria = $IdCategoria
                    )

                    AND m.EstaActivo = 1";


            return $this->enlace->ExecuteSQL($sql);
        } catch (Exception $e) {

            handleException($e);
        }
    }

    /**
     * Obtener detalle completo del menú
     */
    public function get($id)
    {
        try {
            $id = intval($id);

            // Datos principales del menú
            $sql = "SELECT
                IdMenu,
                Nombre,
                HoraInicio,
                HoraFin,
                EstaActivo
            FROM Menu
            WHERE IdMenu = $id";
            $menu = $this->enlace->ExecuteSQL($sql);

            if (!$menu || count($menu) == 0) {
                return null;
            }
            $menu = $menu[0];

            // Disponibilidad
            $sqlDisponibilidad = "SELECT
                                IdDisponibilidad,
                                FechaInicio,
                                FechaFin,
                                DiaSemana
                              FROM MenuDisponibilidad
                              WHERE IdMenu = $id";
            $menu->Disponibilidad = $this->enlace->ExecuteSQL($sqlDisponibilidad) ?: [];

            // Productos completos
            $sqlProductos = "SELECT
                            mi.IdProducto,
                            p.Nombre,
                            p.Descripcion,
                            p.Precio,
                            c.Nombre AS Categoria,
                            pi.Imagen AS Imagen
                         FROM MenuItem mi
                         INNER JOIN Producto p ON mi.IdProducto = p.IdProducto
                         LEFT JOIN Categoria c ON p.IdCategoria = c.IdCategoria
                         LEFT JOIN ProductoImagen pi ON p.IdProducto = pi.IdProducto AND pi.EsPrincipal = 1
                         WHERE mi.IdMenu = $id AND mi.IdProducto IS NOT NULL";
            $menu->Productos = $this->enlace->ExecuteSQL($sqlProductos) ?: [];

            // Combos completos
            $sqlCombos = "SELECT
                            mi.IdCombo,
                            cb.Nombre,
                            cb.Descripcion,
                            cb.PrecioEspecial,
                            c.Nombre AS Categoria,
                            cb.RutaImagen AS Imagen
                      FROM MenuItem mi
                      INNER JOIN Combo cb ON mi.IdCombo = cb.IdCombo
                      LEFT JOIN Categoria c ON cb.IdCategoria = c.IdCategoria
                      WHERE mi.IdMenu = $id AND mi.IdCombo IS NOT NULL";
            $menu->Combos = $this->enlace->ExecuteSQL($sqlCombos) ?: [];

            return $menu;
        } catch (Exception $e) {
            handleException($e);
        }
    }



    /**
     * Items del menú con imágenes
     */
    public function getMenuItemsConImagen($idMenu)
    {
        try {
            $id = intval($idMenu);
            $sql = "SELECT
                    IFNULL(
                        p.Nombre,
                        cb.Nombre
                    ) AS NombreItem,
                    IFNULL(
                        p.Descripcion,
                        cb.Descripcion
                    ) AS Descripcion,
                    IFNULL(
                        p.Precio,
                        cb.PrecioEspecial
                    ) AS Precio,
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
                        ON (

                            p.IdCategoria = c.IdCategoria

                            OR

                            cb.IdCategoria = c.IdCategoria

                        )
                    WHERE mi.IdMenu = $id";
            return $this->enlace->ExecuteSQL($sql);
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
            $activo = isset($data["EstaActivo"])
                ? intval($data["EstaActivo"])
                : 1;

            $sql = "INSERT INTO Menu
                    (
                        Nombre,
                        HoraInicio,
                        HoraFin,
                        EstaActivo
                    )
                    VALUES
                    (
                        '$nombre',
                        '$horaInicio',
                        '$horaFin',
                        $activo
                    )";

            $idMenu =
                $this->enlace->executeSQL_DML_last($sql);

            // Disponibilidad

            if (!empty($data["Disponibilidad"])) {

                foreach ($data["Disponibilidad"] as $disp) {

                    if (empty($disp["DiaSemana"])) {

                        continue;
                    }
                    $fechaInicio =
                        !empty($disp["FechaInicio"])
                        ? "'" . $disp["FechaInicio"] . "'"
                        : "NULL";
                    $fechaFin =
                        !empty($disp["FechaFin"])
                        ? "'" . $disp["FechaFin"] . "'"
                        : "NULL";
                    $dia = "'" . $disp["DiaSemana"] . "'";
                    $sql = "INSERT INTO MenuDisponibilidad
                            (
                                IdMenu,
                                FechaInicio,
                                FechaFin,
                                DiaSemana
                            )
                            VALUES
                            (
                                $idMenu,
                                $fechaInicio,
                                $fechaFin,
                                $dia
                            )";
                    $this->enlace->executeSQL_DML($sql);
                }
            }

            // Productos
            if (!empty($data["Productos"])) {

                foreach ($data["Productos"] as $producto) {
                    $idProducto =
                        intval($producto["IdProducto"]);
                    $sql = "INSERT INTO MenuItem
                            (
                                IdMenu,
                                IdProducto,
                                IdCombo
                            )
                            VALUES
                            (
                                $idMenu,
                                $idProducto,
                                NULL
                            )";
                    $this->enlace->executeSQL_DML($sql);
                }
            }

            // Combos
            if (!empty($data["Combos"])) {
                foreach ($data["Combos"] as $combo) {
                    $idCombo =
                        intval($combo["IdCombo"]);
                    $sql = "INSERT INTO MenuItem
                            (
                                IdMenu,
                                IdProducto,
                                IdCombo
                            )
                            VALUES
                            (
                                $idMenu,
                                NULL,
                                $idCombo
                            )";
                    $this->enlace->executeSQL_DML($sql);
                }
            }
            return $idMenu;
        } catch (Exception $e) {

            handleException($e);
        }
    }

    /**
     * Actualizar menú
     */
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

            $activo = isset($data["EstaActivo"])
                ? intval($data["EstaActivo"])
                : 1;

            // Actualizar datos del menú
            $sql = "UPDATE Menu
                SET
                    Nombre = '$nombre',
                    HoraInicio = '$horaInicio',
                    HoraFin = '$horaFin',
                    EstaActivo = $activo
                WHERE IdMenu = $idMenu";

            $this->enlace->executeSQL_DML($sql);
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

                        $dia = "'" . addslashes($disp["DiaSemana"]) . "'";

                        $sql = "INSERT INTO MenuDisponibilidad
                            (
                                IdMenu,
                                FechaInicio,
                                FechaFin,
                                DiaSemana
                            )
                            VALUES
                            (
                                $idMenu,
                                $fechaInicio,
                                $fechaFin,
                                $dia
                            )";

                        $this->enlace->executeSQL_DML($sql);
                    }
                }
            }

            if (isset($data["Productos"]) || isset($data["Combos"])) {

                $this->enlace->executeSQL_DML(
                    "DELETE FROM MenuItem
                 WHERE IdMenu = $idMenu"
                );

                // Productos
                if (!empty($data["Productos"])) {

                    foreach ($data["Productos"] as $producto) {

                        if (!isset($producto["IdProducto"])) {
                            continue;
                        }

                        $idProducto = intval($producto["IdProducto"]);

                        $sql = "INSERT INTO MenuItem
                            (
                                IdMenu,
                                IdProducto,
                                IdCombo
                            )
                            VALUES
                            (
                                $idMenu,
                                $idProducto,
                                NULL
                            )";

                        $this->enlace->executeSQL_DML($sql);
                    }
                }

                // Combos
                if (!empty($data["Combos"])) {

                    foreach ($data["Combos"] as $combo) {

                        if (!isset($combo["IdCombo"])) {
                            continue;
                        }

                        $idCombo = intval($combo["IdCombo"]);

                        $sql = "INSERT INTO MenuItem
                            (
                                IdMenu,
                                IdProducto,
                                IdCombo
                            )
                            VALUES
                            (
                                $idMenu,
                                NULL,
                                $idCombo
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
     * Eliminación lógica
     */
    public function delete($id)
    {
        try {


            $id = intval($id);


            $sql = "UPDATE Menu

                  SET EstaActivo=0

                  WHERE IdMenu=$id";


            return $this->enlace->executeSQL_DML($sql);
        } catch (Exception $e) {

            handleException($e);
        }
    }
}
