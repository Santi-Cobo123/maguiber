import AsyncStorage from '@react-native-async-storage/async-storage';

const mockPost = jest.fn();
const mockGet = jest.fn();

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: mockPost,
    get: mockGet,
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

const {
  loginUsuario,
  registroUsuario,
  obtenerPerfil,
  obtenerRoles,
  logout,
  getToken,
  getUsuario,
} = require('../../services/authService');

describe('authService — Pruebas Unitarias', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('loginUsuario()', () => {
    test('guarda el token en AsyncStorage cuando el login es exitoso', async () => {
      mockPost.mockResolvedValueOnce({
        data: { success: true, token: 'jwt-token-123', usuario: { id: 1, nombre: 'Javier' } },
      });
      await loginUsuario('javier@test.com', '123456');
      const tokenGuardado = await AsyncStorage.getItem('userToken');
      expect(tokenGuardado).toBe('jwt-token-123');
    });

    test('guarda el objeto usuario en AsyncStorage como JSON', async () => {
      const usuario = { id: 1, nombre: 'Javier', rol: 'Usuario' };
      mockPost.mockResolvedValueOnce({ data: { token: 'tok', usuario } });
      await loginUsuario('javier@test.com', '123456');
      const guardado = await AsyncStorage.getItem('usuario');
      expect(JSON.parse(guardado)).toEqual(usuario);
    });

    test('NO guarda token si la respuesta no lo incluye', async () => {
      mockPost.mockResolvedValueOnce({ data: { success: false } });
      await loginUsuario('javier@test.com', '123456');
      const token = await AsyncStorage.getItem('userToken');
      expect(token).toBeNull();
    });

    test('lanza error del servidor cuando las credenciales son inválidas', async () => {
      const errorServidor = { message: 'Credenciales inválidas', success: false };
      mockPost.mockRejectedValueOnce({ response: { data: errorServidor } });
      await expect(loginUsuario('mal@test.com', 'wrong')).rejects.toEqual(errorServidor);
    });

    test('lanza mensaje de error cuando no hay respuesta del servidor', async () => {
      mockPost.mockRejectedValueOnce({ message: 'Network Error' });
      await expect(loginUsuario('javier@test.com', '123456')).rejects.toBe('Network Error');
    });
  });

  describe('registroUsuario()', () => {
    test('envía los datos correctos al endpoint /registro', async () => {
      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await registroUsuario('Javier', 'javier@test.com', '123456', 2);
      expect(mockPost).toHaveBeenCalledWith('/registro', {
        nombre: 'Javier', email: 'javier@test.com', contraseña: '123456', id_rol: 2,
      });
    });

    test('lanza error cuando el email ya está registrado', async () => {
      const err = { message: 'El email ya está registrado' };
      mockPost.mockRejectedValueOnce({ response: { data: err } });
      await expect(registroUsuario('Javier', 'javier@test.com', '123456', 2)).rejects.toEqual(err);
    });
  });

  describe('logout()', () => {
    test('elimina el token de AsyncStorage', async () => {
      await AsyncStorage.setItem('userToken', 'tok-abc');
      await logout();
      expect(await AsyncStorage.getItem('userToken')).toBeNull();
    });

    test('elimina el usuario de AsyncStorage', async () => {
      await AsyncStorage.setItem('usuario', JSON.stringify({ id: 1 }));
      await logout();
      expect(await AsyncStorage.getItem('usuario')).toBeNull();
    });

    test('retorna true cuando el logout es exitoso', async () => {
      expect(await logout()).toBe(true);
    });
  });

  describe('getToken()', () => {
    test('retorna el token cuando existe', async () => {
      await AsyncStorage.setItem('userToken', 'mi-token');
      expect(await getToken()).toBe('mi-token');
    });

    test('retorna null cuando no hay token', async () => {
      expect(await getToken()).toBeNull();
    });
  });

  describe('getUsuario()', () => {
    test('retorna el objeto usuario parseado', async () => {
      const usuario = { id: 1, nombre: 'Javier' };
      await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
      expect(await getUsuario()).toEqual(usuario);
    });

    test('retorna null cuando no hay usuario guardado', async () => {
      expect(await getUsuario()).toBeNull();
    });

    test('retorna null si el JSON está corrupto', async () => {
      await AsyncStorage.setItem('usuario', 'json-invalido{{{');
      expect(await getUsuario()).toBeNull();
    });
  });

  describe('obtenerRoles()', () => {
    test('retorna el listado de roles', async () => {
      const roles = [{ id: 1, nombre: 'Admin' }, { id: 2, nombre: 'Usuario' }];
      mockGet.mockResolvedValueOnce({ data: { success: true, roles } });
      const resultado = await obtenerRoles();
      expect(resultado.roles).toHaveLength(2);
    });

    test('lanza error cuando el servidor no responde', async () => {
      mockGet.mockRejectedValueOnce({ message: 'Network Error' });
      await expect(obtenerRoles()).rejects.toBe('Network Error');
    });
  });
});