import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AuthService from "../services/AuthService";

/*
 * Contexto de autenticación. Guarda el usuario y el token de sesión,
 * y expone el rol por separado (esta es la variable que el resto de
 * la aplicación debe usar para decidir qué mostrar según el rol,
 * en vez de tomar esa decisión directamente en los componentes visuales).
 */
const AuthContext = createContext(null);

/*
 * La sesión guardada se restaura aquí, al evaluarse el módulo, y no
 * dentro de un useEffect del proveedor. Esto es importante: los efectos
 * de un componente hijo (por ejemplo, la pantalla de detalle de un
 * pedido pidiendo sus datos apenas se monta) se ejecutan ANTES que el
 * efecto del proveedor que envuelve a toda la aplicación, así que si el
 * encabezado de autorización se fijara en un useEffect, esas primeras
 * peticiones saldrían sin token y el backend respondería 401.
 */
function leerSesionGuardada() {
  const tokenGuardado = localStorage.getItem("ru_token");
  const usuarioGuardado = localStorage.getItem("ru_usuario");

  if (!tokenGuardado || !usuarioGuardado) {
    return { token: null, usuario: null };
  }

  try {
    const payload = jwtDecode(tokenGuardado);

    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("ru_token");
      localStorage.removeItem("ru_usuario");
      return { token: null, usuario: null };
    }

    return { token: tokenGuardado, usuario: JSON.parse(usuarioGuardado) };
  } catch {
    localStorage.removeItem("ru_token");
    localStorage.removeItem("ru_usuario");
    return { token: null, usuario: null };
  }
}

const sesionInicial = leerSesionGuardada();

if (sesionInicial.token) {
  axios.defaults.headers.common.Authorization = `Bearer ${sesionInicial.token}`;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(sesionInicial.token);
  const [usuario, setUsuario] = useState(sesionInicial.usuario);

  const login = useCallback(async (correo, contrasena) => {
    const response = await AuthService.login(correo, contrasena);
    const { token: nuevoToken, usuario: usuarioAutenticado } = response.data;

    axios.defaults.headers.common.Authorization = `Bearer ${nuevoToken}`;
    localStorage.setItem("ru_token", nuevoToken);
    localStorage.setItem("ru_usuario", JSON.stringify(usuarioAutenticado));

    setToken(nuevoToken);
    setUsuario(usuarioAutenticado);

    return usuarioAutenticado;
  }, []);

  const logout = useCallback(() => {
    delete axios.defaults.headers.common.Authorization;
    localStorage.removeItem("ru_token");
    localStorage.removeItem("ru_usuario");
    setToken(null);
    setUsuario(null);
  }, []);

  const value = {
    usuario,
    token,
    rol: usuario?.NombreRol || null,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
