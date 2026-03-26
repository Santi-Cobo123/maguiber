// __tests__/e2e/test-boton-login.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../screens/LoginScreen';

jest.mock('../../services/authService', () => ({
  loginUsuario: jest.fn(),
}));

import { loginUsuario } from '../../services/authService';

describe('Prueba directa del botón login', () => {
  test('El botón llama a loginUsuario', async () => {
    const mockOnSuccess = jest.fn();
    loginUsuario.mockResolvedValueOnce({ success: true });
    
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen onSuccess={mockOnSuccess} onRegister={() => {}} />
    );
    
    // Completar campos
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Contraseña'), '123456');
    
    // Presionar botón
    fireEvent.press(getByText('Inicia Sesión'));
    
    // Verificar que se llamó a loginUsuario
    await waitFor(() => {
      expect(loginUsuario).toHaveBeenCalledWith('test@test.com', '123456');
    });
  });
});