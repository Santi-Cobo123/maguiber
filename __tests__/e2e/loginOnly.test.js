// __tests__/e2e/flujo-completo.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../../App';

// SOLO mockear AsyncStorage para evitar errores, pero NO mockear authService
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock de Alert para evitar que muestre ventanas
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('E2E — Flujo completo de autenticación', () => {
  
  // Función para navegar onboarding -> registro
  const navegarARegistro = async (queryByText) => {
    // Presionar Siguiente 3 veces
    for (let i = 0; i < 3; i++) {
      const nextButton = queryByText(/siguiente/i);
      if (nextButton) {
        fireEvent.press(nextButton);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Presionar botón final
    const startButton = queryByText(/comenzar|empezar|continuar/i);
    if (startButton) {
      fireEvent.press(startButton);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // PRUEBA 1: REGISTRO Y LOGIN
  test('Flujo completo: Registro -> Login -> Ver perfil', async () => {
    const { getByPlaceholderText, getByText, queryByText, getAllByPlaceholderText } = render(<App />);
    
    // Navegar a registro
    await navegarARegistro(queryByText);
    
    // Verificar que estamos en registro
    await waitFor(() => {
      expect(getByPlaceholderText(/nombre completo/i)).toBeTruthy();
    }, { timeout: 5000 });
    
    // Datos de prueba
    const email = `test_${Date.now()}@test.com`;
    const password = '123456';
    const nombre = 'Usuario Test';
    
    // Completar registro
    fireEvent.changeText(getByPlaceholderText(/nombre completo/i), nombre);
    fireEvent.changeText(getByPlaceholderText(/email/i), email);
    
    const passwordInputs = getAllByPlaceholderText(/contraseña/i);
    fireEvent.changeText(passwordInputs[0], password);
    fireEvent.changeText(passwordInputs[1], password);
    
    fireEvent.press(getByText(/registrarse/i));
    
    // Esperar mensaje de éxito
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.stringContaining('Éxito'),
        expect.any(String)
      );
    }, { timeout: 5000 });
    
    // Ir a login (botón "Volver")
    const backButton = getByText(/volver/i);
    fireEvent.press(backButton);
    
    // Login
    await waitFor(() => {
      expect(getByPlaceholderText(/email/i)).toBeTruthy();
    }, { timeout: 5000 });
    
    fireEvent.changeText(getByPlaceholderText(/email/i), email);
    fireEvent.changeText(getByPlaceholderText(/contraseña/i), password);
    fireEvent.press(getByText(/iniciar sesión/i));
    
    // Verificar que estamos en Home
    await waitFor(() => {
      expect(getByText(nombre)).toBeTruthy();
    }, { timeout: 10000 });
    
    console.log('✅ Registro y login exitoso');
  }, 60000);
  
  // PRUEBA 2: LOGIN CON USUARIO EXISTENTE
  test('Usuario existente inicia sesión correctamente', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<App />);
    
    // Navegar a registro
    await navegarARegistro(queryByText);
    
    // Ir a login (botón "Volver")
    await waitFor(() => {
      const backButton = getByText(/volver/i);
      fireEvent.press(backButton);
    });
    
    // Login con datos de prueba (admin)
    await waitFor(() => {
      expect(getByPlaceholderText(/email/i)).toBeTruthy();
    }, { timeout: 5000 });
    
    fireEvent.changeText(getByPlaceholderText(/email/i), 'admin@test.com');
    fireEvent.changeText(getByPlaceholderText(/contraseña/i), '123456');
    fireEvent.press(getByText(/iniciar sesión/i));
    
    // Verificar que estamos en Home
    await waitFor(() => {
      expect(getByText(/Admin User|admin/i)).toBeTruthy();
    }, { timeout: 10000 });
    
    console.log('✅ Login exitoso');
  }, 60000);
});