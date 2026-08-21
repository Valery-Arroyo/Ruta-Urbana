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
            // Devuelve los datos contenidos en el JWT.
            $usuarioAutenticado = AuthMiddleware::verificar([
                'Administrador',
                'Encargado'
            ]);

            $response = new Response();
            $usuarioModel = new UsuarioModel();

            $data = json_decode(file_get_contents("php://input"), true);

            $nombre = trim($data['NombreCompleto'] ?? '');
            $correo = trim($data['Correo'] ?? '');
            $contrasena = $data['Contrasena'] ?? '';
            $direccion = trim($data['Direccion'] ?? '');
            $idRol = intval($data['IdRol'] ?? 0);

            if ($nombre === '' || strlen($nombre) < 3) {
                $response->status(400)->toJSON([
                    'result' => 'El nombre es requerido y debe tener al menos 3 caracteres'
                ]);
                return;
            }

            if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
                $response->status(400)->toJSON([
                    'result' => 'Debe ingresar un correo electrónico válido'
                ]);
                return;
            }

            if ($contrasena === '' || strlen($contrasena) < 8) {
                $response->status(400)->toJSON([
                    'result' => 'La contraseña es requerida y debe tener al menos 8 caracteres'
                ]);
                return;
            }

            if (strlen($direccion) > 200) {
                $response->status(400)->toJSON([
                    'result' => 'La dirección no puede superar los 200 caracteres'
                ]);
                return;
            }

            if ($idRol <= 0) {
                $response->status(400)->toJSON([
                    'result' => 'Debe seleccionar un rol'
                ]);
                return;
            }

            $rolSeleccionado = $usuarioModel->getRolPorId($idRol);

            if (!$rolSeleccionado) {
                $response->status(400)->toJSON([
                    'result' => 'El rol seleccionado no existe'
                ]);
                return;
            }

            $rolActual = $usuarioAutenticado->NombreRol;

            // Administrador puede crear Encargado, Cocina y Cliente.
            if (
                $rolActual === 'Administrador' &&
                !in_array(
                    $rolSeleccionado['NombreRol'],
                    ['Encargado', 'Cocina', 'Cliente']
                )
            ) {
                $response->status(403)->toJSON([
                    'result' => 'El administrador solo puede crear usuarios Encargado, Cocina o Cliente'
                ]);
                return;
            }

            // Encargado solamente puede crear clientes.
            if (
                $rolActual === 'Encargado' &&
                $rolSeleccionado['NombreRol'] !== 'Cliente'
            ) {
                $response->status(403)->toJSON([
                    'result' => 'El encargado solo puede crear usuarios con rol Cliente'
                ]);
                return;
            }

            if ($usuarioModel->existeCorreo($correo)) {
                $response->status(409)->toJSON([
                    'result' => 'Ya existe un usuario con ese correo'
                ]);
                return;
            }

            $datosUsuario = [
                'NombreCompleto' => $nombre,
                'Correo' => $correo,
                'Contrasena' => $contrasena,
                'Direccion' => $direccion,
                'IdRol' => $rolSeleccionado['IdRol'],
                'Activo' => 1
            ];

            $id = $usuarioModel->create($datosUsuario);

            $response->status(201)->toJSON([
                'success' => 1,
                'id' => $id,
                'result' => 'Usuario creado correctamente'
            ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    // Actualizar un usuario existente 
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

    public function registro()
    {
        try {
            $response = new Response();
            $usuarioModel = new UsuarioModel();

            $data = json_decode(file_get_contents("php://input"), true);

            $nombre = trim($data['NombreCompleto'] ?? '');
            $correo = trim($data['Correo'] ?? '');
            $contrasena = $data['Contrasena'] ?? '';
            $direccion = trim($data['Direccion'] ?? '');

            // Validar nombre
            if ($nombre === '' || strlen($nombre) < 3) {
                $response->status(400)->toJSON([
                    'result' => 'El nombre es requerido y debe tener al menos 3 caracteres'
                ]);
                return;
            }

            // Validar correo
            if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
                $response->status(400)->toJSON([
                    'result' => 'Debe ingresar un correo electrónico válido'
                ]);
                return;
            }

            // Validar contraseña
            if ($contrasena === '' || strlen($contrasena) < 8) {
                $response->status(400)->toJSON([
                    'result' => 'La contraseña es requerida y debe tener al menos 8 caracteres'
                ]);
                return;
            }

            // Validar longitud de dirección
            if (strlen($direccion) > 200) {
                $response->status(400)->toJSON([
                    'result' => 'La dirección no puede superar los 200 caracteres'
                ]);
                return;
            }

            // Validar correo duplicado
            if ($usuarioModel->existeCorreo($correo)) {
                $response->status(409)->toJSON([
                    'result' => 'Ya existe un usuario con ese correo'
                ]);
                return;
            }

            // El rol se obtiene exclusivamente en el servidor.
            $rolCliente = $usuarioModel->getRolPorNombre('Cliente');

            if (!$rolCliente) {
                $response->status(500)->toJSON([
                    'result' => 'No se encontró el rol Cliente'
                ]);
                return;
            }

            // Nunca se utiliza un IdRol enviado por React.
            $datosUsuario = [
                'NombreCompleto' => $nombre,
                'Correo' => $correo,
                'Contrasena' => $contrasena,
                'Direccion' => $direccion,
                'IdRol' => $rolCliente['IdRol'],
                'Activo' => 1
            ];

            $id = $usuarioModel->create($datosUsuario);

            $response->status(201)->toJSON([
                'success' => 1,
                'id' => $id,
                'result' => 'Registro realizado correctamente'
            ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
