<?php
class UsuarioModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* Buscar un usuario activo por correo, junto con el nombre de su rol */
    public function getPorCorreo($correo)
    {
        try {
            $correo = addslashes($correo);

            $sql = "SELECT
                        u.IdUsuario,
                        u.NombreCompleto,
                        u.Correo,
                        u.ContrasenaHash,
                        u.Direccion,
                        u.Activo,
                        u.IdRol,
                        r.NombreRol
                    FROM Usuario u
                    INNER JOIN Rol r ON u.IdRol = r.IdRol
                    WHERE u.Correo = '$correo' AND u.Activo = 1";

            $resultado = $this->enlace->executeSQL($sql, "asoc");

            return $resultado ? $resultado[0] : null;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Obtener un usuario por su Id (para mostrar sus datos en el pedido) */
    public function getPorId($id)
    {
        try {
            $idUsuario = intval($id);

            $sql = "SELECT
                        u.IdUsuario,
                        u.NombreCompleto,
                        u.Correo,
                        u.Direccion,
                        u.IdRol,
                        r.NombreRol
                    FROM Usuario u
                    INNER JOIN Rol r ON u.IdRol = r.IdRol
                    WHERE u.IdUsuario = $idUsuario";

            $resultado = $this->enlace->executeSQL($sql, "asoc");

            return $resultado ? $resultado[0] : null;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /*
     * Lista de clientes activos, para que el encargado los pueda
     * seleccionar al registrar un pedido a nombre de un cliente.
     */
    public function getClientes()
    {
        try {
            $sql = "SELECT
                        u.IdUsuario,
                        u.NombreCompleto,
                        u.Correo,
                        u.Direccion
                    FROM Usuario u
                    INNER JOIN Rol r ON u.IdRol = r.IdRol
                    WHERE r.NombreRol = 'Cliente' AND u.Activo = 1
                    ORDER BY u.NombreCompleto";

            return $this->enlace->executeSQL($sql, "asoc");
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
