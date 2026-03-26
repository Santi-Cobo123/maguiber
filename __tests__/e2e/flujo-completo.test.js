// __tests__/e2e/flujo-completo.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import App from '../../App';

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../services/authService', () => ({
  loginUsuario: jest.fn(),
  registroUsuario: jest.fn(),
  obtenerPerfil: jest.fn(),
  obtenerRoles: jest.fn(),
  logout: jest.fn(),
  getToken: jest.fn(),
  getUsuario: jest.fn(),
}));

import { loginUsuario, registroUsuario, obtenerPerfil, obtenerRoles } from '../../services/authService';

describe('E2E — Flujo completo de autenticación', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    obtenerRoles.mockResolvedValue({
      success: true,
      roles: [{ id: 1, nombre: 'Admin' }, { id: 2, nombre: 'Usuario' }]
    });
  });

  const navegarOnboarding = async (getByText, queryByText) => {
    await waitFor(() => {
      expect(queryByText(/saltar/i)).toBeTruthy();
    }, { timeout: 10000 });
    
    for (let i = 0; i < 3; i++) {
      const nextButton = queryByText(/siguiente/i);
      fireEvent.press(nextButton);
      await new Promise(r => setTimeout(r, 500));
    }
    
    const startButton = getByText(/comenzar/i);
    fireEvent.press(startButton);
    await new Promise(r => setTimeout(r, 500));
  };

  // PRUEBA 1: REGISTRO Y LOGIN
  test('Flujo completo: Registro -> Login -> Home', async () => {
    const mockUsuario = { nombre: 'Usuario Nuevo', email: 'nuevo@test.com', rol: 'Usuario', activo: true };
    
    registroUsuario.mockResolvedValueOnce({ success: true });
    loginUsuario.mockResolvedValueOnce({ success: true, token: 'token', usuario: mockUsuario });
    obtenerPerfil.mockResolvedValueOnce({ success: true, usuario: mockUsuario });
    
    const { getByPlaceholderText, getByText, queryByText, getAllByPlaceholderText } = render(<App />);
    
    await navegarOnboarding(getByText, queryByText);
    
    await waitFor(() => {
      expect(getByPlaceholderText(/nombre completo/i)).toBeTruthy();
    }, { timeout: 5000 });
    
    fireEvent.changeText(getByPlaceholderText(/nombre completo/i), 'Usuario Nuevo');
    fireEvent.changeText(getByPlaceholderText(/email/i), 'nuevo@test.com');
    const passwordInputs = getAllByPlaceholderText(/contraseña/i);
    fireEvent.changeText(passwordInputs[0], '123456');
    fireEvent.changeText(passwordInputs[1], '123456');
    fireEvent.press(getByText(/registrarse/i));
    
    await waitFor(() => {
      expect(registroUsuario).toHaveBeenCalled();
    }, { timeout: 5000 });
    
    // Esperar pantalla de login
    await waitFor(() => {
      expect(getByPlaceholderText(/email/i)).toBeTruthy();
    }, { timeout: 5000 });
    
    const emailInput = getByPlaceholderText(/email/i);
    const passwordInput = getByPlaceholderText(/contraseña/i);
    
    fireEvent.changeText(emailInput, 'nuevo@test.com');
    fireEvent.changeText(passwordInput, '123456');
    
    await new Promise(r => setTimeout(r, 500));
    
    // Buscar el botón por el texto exacto y presionarlo
    const loginButton = getByText('Inicia Sesión');
    expect(loginButton).toBeTruthy();
    
    // Usar touchable events directamente
    fireEvent(loginButton, 'press');
    
    // También intentar con touchable highlight si es necesario
    // fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(loginUsuario).toHaveBeenCalled();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(obtenerPerfil).toHaveBeenCalled();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(getByText('Usuario Nuevo')).toBeTruthy();
    }, { timeout: 10000 });
    
    console.log('✅ Flujo completo exitoso');
  }, 60000);

  // PRUEBA 2: LOGIN CON USUARIO EXISTENTE
  test('Usuario existente inicia sesión', async () => {
    const mockAdmin = { nombre: 'Admin User', email: 'admin@test.com', rol: 'Admin', activo: true };
    
    loginUsuario.mockResolvedValueOnce({ success: true, token: 'token', usuario: mockAdmin });
    obtenerPerfil.mockResolvedValueOnce({ success: true, usuario: mockAdmin });
    
    const { getByPlaceholderText, getByText, queryByText } = render(<App />);
    
    await navegarOnboarding(getByText, queryByText);
    
    // Ir a Login
    await waitFor(() => {
      const backButton = getByText(/volver/i);
      fireEvent.press(backButton);
    });
    
    await waitFor(() => {
      expect(getByPlaceholderText(/email/i)).toBeTruthy();
    }, { timeout: 5000 });
    
    const emailInput = getByPlaceholderText(/email/i);
    const passwordInput = getByPlaceholderText(/contraseña/i);
    
    fireEvent.changeText(emailInput, 'admin@test.com');
    fireEvent.changeText(passwordInput, '123456');
    
    await new Promise(r => setTimeout(r, 500));
    
    const loginButton = getByText('Inicia Sesión');
    fireEvent(loginButton, 'press');
    
    await waitFor(() => {
      expect(loginUsuario).toHaveBeenCalled();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(obtenerPerfil).toHaveBeenCalled();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(getByText('Admin User')).toBeTruthy();
    }, { timeout: 10000 });
    
    console.log('✅ Login exitoso');
  }, 60000);

  // PRUEBA 3: ERROR CONTRASEÑAS NO COINCIDEN
  test('Error si contraseñas no coinciden', async () => {
    const { getByPlaceholderText, getByText, queryByText, getAllByPlaceholderText } = render(<App />);
    
    await navegarOnboarding(getByText, queryByText);
    
    await waitFor(() => {
      expect(getByPlaceholderText(/nombre completo/i)).toBeTruthy();
    }, { timeout: 5000 });
    
    fireEvent.changeText(getByPlaceholderText(/nombre completo/i), 'Test');
    fireEvent.changeText(getByPlaceholderText(/email/i), 'test@test.com');
    
    const passwordInputs = getAllByPlaceholderText(/contraseña/i);
    fireEvent.changeText(passwordInputs[0], '123456');
    fireEvent.changeText(passwordInputs[1], '654321');
    
    fireEvent.press(getByText(/registrarse/i));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    }, { timeout: 5000 });
    
    console.log('✅ Error mostrado');
  }, 60000);
});