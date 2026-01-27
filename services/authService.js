// services/authService.js (Para el frontend Expo)
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
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
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

        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// OBTENER PERFIL
export const obtenerPerfil = async () => {
    try {
        const response = await apiClient.get('/perfil');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// OBTENER ROLES
export const obtenerRoles = async () => {
    try {
        const response = await apiClient.get('/roles');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// LOGOUT
export const logout = async () => {
    try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('usuario');
        return true;
    } catch (error) {
        throw error;
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