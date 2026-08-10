<?php
class Usuario
{
    // Mantenimiento de usuarios: lista completa, solo para el administrador
    public function index()
    {
        try {
            AuthMiddleware::verificar(['Administrador']);

            $response = new Response();
            $usuario = new UsuarioModel();

            $response->toJSON(['usuarios' => $usuario->all() ?: []]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Obtener un usuario por su Id, para editarlo en el mantenimiento
    public function get($id)
    {
        try {
            AuthMiddleware::verificar(['Administrador']);

            $response = new Response();
            $usuario = new UsuarioModel();

            $result = $usuario->getPorId($id);

            if (!$result) {
                $response->status(404)->toJSON(['result' => 'Usuario no encontrado']);
                return;
            }

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Catálogo de roles, para el formulario de mantenimiento
    public function roles()
    {
        try {
            AuthMiddleware::verificar(['Administrador']);

            $response = new Response();
            $usuario = new UsuarioModel();

            $response->toJSON(['roles' => $usuario->getRoles() ?: []]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Lista de clientes, para que el encargado los elija al registrar un pedido
    public function clientes()
    {
        try {
            AuthMiddleware::verificar(['Administrador', 'Encargado']);

            $response = new Response();
            $usuario = new UsuarioModel();

            $response->toJSON(['clientes' => $usuario->getClientes() ?: []]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Inicio de sesión: valida credenciales y devuelve el token junto con los datos del usuario
    public function login()
    {
        try {
            $response = new Response();
            $usuarioModel = new UsuarioModel();

            $data = json_decode(file_get_contents("php://input"), true);
            $correo = $data['Correo'] ?? '';
            $contrasena = $data['Contrasena'] ?? '';

            $usuario = $usuarioModel->getPorCorreo($correo);

            if (!$usuario || !password_verify($contrasena, $usuario['ContrasenaHash'])) {
                $response->status(401)->toJSON(['result' => 'Correo o contraseña incorrectos']);
                return;
            }

            $token = AuthMiddleware::generarToken($usuario);
            unset($usuario['ContrasenaHash']);

            $response->toJSON(['token' => $token, 'usuario' => $usuario]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Registrar un nuevo usuario desde el mantenimiento (solo administrador)
    public function create()
    {
        try {
            AuthMiddleware::verificar(['Administrador']);

            $response = new Response();
            $usuarioModel = new UsuarioModel();

            $data = json_decode(file_get_contents("php://input"), true);

            if (empty($data['Contrasena']) || strlen($data['Contrasena']) < 8) {
                $response->status(400)->toJSON(['result' => 'La contraseña es requerida y debe tener al menos 8 caracteres']);
                return;
            }

            if ($usuarioModel->existeCorreo($data['Correo'] ?? '')) {
                $response->status(409)->toJSON(['result' => 'Ya existe un usuario con ese correo']);
                return;
            }

            $id = $usuarioModel->create($data);

            $response->toJSON(['id' => $id]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Actualizar un usuario existente (solo administrador)
    public function update($id)
    {
        try {
            AuthMiddleware::verificar(['Administrador']);

            $response = new Response();
            $usuarioModel = new UsuarioModel();

            $data = json_decode(file_get_contents("php://input"), true);

            if ($usuarioModel->existeCorreo($data['Correo'] ?? '', $id)) {
                $response->status(409)->toJSON(['result' => 'Ya existe un usuario con ese correo']);
                return;
            }

            $result = $usuarioModel->update($id, $data);

            $response->toJSON(['success' => $result ? 1 : 0]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Borrado lógico de un usuario (solo administrador)
    public function delete($id)
    {
        try {
            AuthMiddleware::verificar(['Administrador']);

            $response = new Response();
            $usuarioModel = new UsuarioModel();

            $result = $usuarioModel->delete($id);

            $response->toJSON(['success' => $result ? 1 : 0]);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
