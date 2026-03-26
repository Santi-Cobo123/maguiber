// __tests__/e2e/simple.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../../App';

describe('Prueba de navegación con Siguiente', () => {
  test('Navega con Siguiente hasta llegar a login', async () => {
    const { getByText, queryByText, debug } = render(<App />);
    
    // Esperar a que cargue
    await waitFor(() => {
      const nextButton = queryByText(/siguiente/i);
      expect(nextButton).toBeTruthy();
    });
    
    console.log('========== PANTALLA INICIAL ==========');
    debug();
    
    // Presionar "Siguiente" varias veces
    let nextButton = queryByText(/siguiente/i);
    let contador = 0;
    
    while (nextButton && contador < 5) {
      console.log(`Presionando Siguiente (${contador + 1})...`);
      fireEvent.press(nextButton);
      await waitFor(() => {}, { timeout: 1000 });
      nextButton = queryByText(/siguiente/i);
      contador++;
    }
    
    // Buscar botón "Comenzar" o similar
    const startButton = queryByText(/comenzar|empezar|continuar/i);
    if (startButton) {
      console.log('Presionando botón final...');
      fireEvent.press(startButton);
      await waitFor(() => {}, { timeout: 1000 });
    }
    
    console.log('========== DESPUÉS DE NAVEGAR ==========');
    debug();
    
    // Verificar si aparece login
    const loginText = queryByText(/iniciar sesión/i);
    const emailField = queryByText(/email/i);
    
    console.log('¿Aparece "iniciar sesión"?', !!loginText);
    console.log('¿Aparece "email"?', !!emailField);
  }, 30000);
});