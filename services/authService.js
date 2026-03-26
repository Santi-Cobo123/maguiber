// services/authService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.4:5000/api/auth';

// Crear instancia de axios
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

// Interceptor para agregar token a cada petición
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// REGISTRO
export const registroUsuario = async (nombre, email, contraseña, id_rol) => {
    try {
        const response = await apiClient.post('/registro', {
            nombre,
            email,
            contraseña,
            id_rol
        });
        return { success: true, data: response.data };
    } catch (error) {
        throw { success: false, message: error.response?.data?.message || error.message };
    }
};

// LOGIN
export const loginUsuario = async (email, contraseña) => {
    try {
        const response = await apiClient.post('/login', {
            email,
            contraseña
        });

        if (response.data.token) {
            await AsyncStorage.setItem('userToken', response.data.token);
            await AsyncStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        }

        // Devolver estructura consistente
        return { 
            success: true, 
            token: response.data.token,
            usuario: response.data.usuario 
        };
    } catch (error) {
        throw { 
            success: false, 
            message: error.response?.data?.message || 'Error al iniciar sesión' 
        };
    }
};

// OBTENER PERFIL
export const obtenerPerfil = async () => {
    try {
        const response = await apiClient.get('/perfil');
        // Devolver estructura consistente
        return { 
            success: true, 
            usuario: response.data.usuario || response.data // Asegura compatibilidad
        };
    } catch (error) {
        throw { 
            success: false, 
            message: error.response?.data?.message || 'No se pudo cargar el perfil' 
        };
    }
};

// OBTENER ROLES
export const obtenerRoles = async () => {
    try {
        const response = await apiClient.get('/roles');
        return { success: true, roles: response.data };
    } catch (error) {
        throw { success: false, message: error.response?.data?.message || error.message };
    }
};

// LOGOUT
export const logout = async () => {
    try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('usuario');
        return { success: true };
    } catch (error) {
        throw { success: false, message: error.message };
    }
};

// OBTENER TOKEN GUARDADO
export const getToken = async () => {
    try {
        return await AsyncStorage.getItem('userToken');
    } catch (error) {
        return null;
    }
};

// OBTENER USUARIO GUARDADO
export const getUsuario = async () => {
    try {
        const usuario = await AsyncStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) : null;
    } catch (error) {
        return null;
    }
};

export default apiClient;