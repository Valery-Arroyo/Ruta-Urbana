<?php
class UsuarioModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    // Obtener un usuario por su correo electrónico
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

    // Obtener un usuario por su ID
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

    // Obtener todos los clientes activos
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

    // Obtener todos los usuarios, incluyendo su rol y estado activo
    public function all()
    {
        try {
            $sql = "SELECT
                        u.IdUsuario,
                        u.NombreCompleto,
                        u.Correo,
                        u.Direccion,
                        u.Activo,
                        u.IdRol,
                        r.NombreRol
                    FROM Usuario u
                    INNER JOIN Rol r ON u.IdRol = r.IdRol
                    ORDER BY u.NombreCompleto";

            return $this->enlace->executeSQL($sql, "asoc");
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getRoles()
    {
        try {
            $sql = "SELECT IdRol, NombreRol FROM Rol ORDER BY NombreRol";
            return $this->enlace->executeSQL($sql, "asoc");
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //  Verifica si un correo ya está registrado en la base de datos, 
    // excluyendo opcionalmente un ID de usuario específico 
    public function existeCorreo($correo, $idUsuarioExcluir = null)
    {
        try {
            $correo = addslashes($correo);
            $sql = "SELECT IdUsuario FROM Usuario WHERE Correo = '$correo'";

            if ($idUsuarioExcluir) {
                $sql .= " AND IdUsuario <> " . intval($idUsuarioExcluir);
            }

            $resultado = $this->enlace->executeSQL($sql, "asoc");

            return !empty($resultado);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Crear un nuevo usuario
    public function create($data)
    {
        try {
            $nombreCompleto = addslashes($data['NombreCompleto']);
            $correo = addslashes($data['Correo']);
            $direccion = !empty($data['Direccion']) ? addslashes($data['Direccion']) : null;
            $idRol = intval($data['IdRol']);
            $activo = isset($data['Activo']) ? intval($data['Activo']) : 1;

            $contrasenaHash = password_hash($data['Contrasena'], PASSWORD_BCRYPT);

            $sql = "INSERT INTO Usuario
                        (NombreCompleto, Correo, ContrasenaHash, Direccion, Activo, IdRol)
                    VALUES
                        ('$nombreCompleto', '$correo', '$contrasenaHash',
                         " . ($direccion ? "'$direccion'" : "NULL") . ", $activo, $idRol)";

            return $this->enlace->executeSQL_DML_last($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Actualizar un usuario existente
    public function update($id, $data)
    {
        try {
            $idUsuario = intval($id);
            $nombreCompleto = addslashes($data['NombreCompleto']);
            $correo = addslashes($data['Correo']);
            $direccion = !empty($data['Direccion']) ? addslashes($data['Direccion']) : null;
            $idRol = intval($data['IdRol']);
            $activo = isset($data['Activo']) ? intval($data['Activo']) : 1;

            $sql = "UPDATE Usuario SET
                        NombreCompleto = '$nombreCompleto',
                        Correo = '$correo',
                        Direccion = " . ($direccion ? "'$direccion'" : "NULL") . ",
                        IdRol = $idRol,
                        Activo = $activo";

            if (!empty($data['Contrasena'])) {
                $contrasenaHash = password_hash($data['Contrasena'], PASSWORD_BCRYPT);
                $sql .= ", ContrasenaHash = '$contrasenaHash'";
            }

            $sql .= " WHERE IdUsuario = $idUsuario";

            $this->enlace->executeSQL_DML($sql);

            return true;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Borrado lógico: el usuario deja de poder iniciar sesión, pero se conserva su historial */
    public function delete($id)
    {
        try {
            $idUsuario = intval($id);
            $sql = "UPDATE Usuario SET Activo = 0 WHERE IdUsuario = $idUsuario";

            $this->enlace->executeSQL_DML($sql);

            return true;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Obtener un rol por su ID
    public function getRolPorId($id)
    {
        try {
            $idRol = intval($id);

            $sql = "SELECT IdRol, NombreRol
                FROM Rol
                WHERE IdRol = $idRol";

            $resultado = $this->enlace->executeSQL($sql, "asoc");

            return $resultado ? $resultado[0] : null;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Obtener un rol por su nombre
    public function getRolPorNombre($nombreRol)
    {
        try {
            $nombreRol = addslashes($nombreRol);

            $sql = "SELECT IdRol, NombreRol
                FROM Rol
                WHERE NombreRol = '$nombreRol'
                LIMIT 1";

            $resultado = $this->enlace->executeSQL($sql, "asoc");

            return $resultado ? $resultado[0] : null;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
}
