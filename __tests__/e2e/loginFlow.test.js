// __tests__/e2e/loginOnly.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../../App';
import { loginUsuario } from '../../services/authService';

jest.mock('../../services/authService', () => ({
  loginUsuario: jest.fn(),
  registroUsuario: jest.fn(),
  obtenerPerfil: jest.fn(),
  obtenerRoles: jest.fn(),
  logout: jest.fn(),
  getToken: jest.fn(),
  getUsuario: jest.fn(),
}));

describe('Login solo', () => {
  test('Debe poder iniciar sesión', async () => {
    loginUsuario.mockResolvedValueOnce({
      success: true,
      token: 'token',
      usuario: { nombre: 'Test User', email: 'test@test.com', rol: 'Usuario' }
    });

    const { getByPlaceholderText, getByText, queryByText, debug } = render(<App />);
    
    // Debug inicial
    console.log('========== INICIO ==========');
    debug();
    
    // Presionar Siguiente 3 veces
    for (let i = 0; i < 3; i++) {
      const nextButton = queryByText(/siguiente/i);
      if (nextButton) {
        console.log(`Presionando Siguiente ${i + 1}`);
        fireEvent.press(nextButton);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Presionar botón final
    const startButton = queryByText(/comenzar|empezar|continuar/i);
    if (startButton) {
      console.log('Presionando botón final');
      fireEvent.press(startButton);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Debug después de onboarding
    console.log('========== DESPUÉS ONBOARDING ==========');
    debug();
    
    // Buscar botón "Volver" para ir a login
    const backButton = queryByText(/volver/i);
    if (backButton) {
      console.log('Presionando Volver');
      fireEvent.press(backButton);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Debug después de volver
    console.log('========== DESPUÉS VOLVER ==========');
    debug();
    
    // Login
    await waitFor(() => {
      expect(getByPlaceholderText(/email/i)).toBeTruthy();
    }, { timeout: 5000 });
    
    fireEvent.changeText(getByPlaceholderText(/email/i), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText(/contraseña/i), '123456');
    fireEvent.press(getByText(/iniciar sesión/i));
    
    await waitFor(() => {
      expect(getByText('Test User')).toBeTruthy();
    }, { timeout: 5000 });
    
    console.log('✅ Login exitoso');
  }, 30000);
});