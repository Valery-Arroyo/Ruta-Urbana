<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware
{
    // Genera el token para un usuario que acaba de iniciar sesión
    public static function generarToken($usuario)
    {
        $payload = [
            'IdUsuario' => $usuario['IdUsuario'],
            'NombreCompleto' => $usuario['NombreCompleto'],
            'Correo' => $usuario['Correo'],
            'NombreRol' => $usuario['NombreRol'],
            'iat' => time(),
            'exp' => time() + (60 * 60 * 8), // 8 horas
        ];

        return JWT::encode($payload, Config::get('SECRET_KEY'), 'HS256');
    }

    public static function verificar($rolesPermitidos = [])
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

        if (!$authHeader || stripos($authHeader, 'Bearer ') !== 0) {
            http_response_code(401);
            echo json_encode(['result' => 'No se proporcionó un token de acceso']);
            exit;
        }

        $token = substr($authHeader, 7);

        try {
            $decoded = JWT::decode($token, new Key(Config::get('SECRET_KEY'), 'HS256'));
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(['result' => 'Token inválido o expirado']);
            exit;
        }

        if (!empty($rolesPermitidos) && !in_array($decoded->NombreRol, $rolesPermitidos)) {
            http_response_code(403);
            echo json_encode(['result' => 'No tiene permisos para esta acción']);
            exit;
        }

        return $decoded;
    }
}
