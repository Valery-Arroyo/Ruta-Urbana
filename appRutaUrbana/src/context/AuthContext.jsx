import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AuthService from "../services/AuthService";

const AuthContext = createContext(null);

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
