// __tests__/integration/LoginScreen.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../../screens/LoginScreen';
import { loginUsuario } from '../../services/authService';

jest.mock('../../services/authService', () => ({
    loginUsuario: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('LoginScreen — Pruebas de Integración', () => {
    const mockOnSuccess = jest.fn();
    const mockOnRegister = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderLogin = () => {
        return render(
            <LoginScreen 
                onSuccess={mockOnSuccess}
                onRegister={mockOnRegister}
            />
        );
    };

    describe('Login exitoso', () => {
        test('llama a loginUsuario con las credenciales ingresadas', async () => {
            loginUsuario.mockResolvedValueOnce({ 
                success: true, 
                token: 'fake-token',
                usuario: { email: 'javier@test.com', nombre: 'Javier' }
            });
            
            const { getByPlaceholderText, getByText } = renderLogin();
            
            fireEvent.changeText(getByPlaceholderText('Email'), 'javier@test.com');
            fireEvent.changeText(getByPlaceholderText('Contraseña'), '123456');
            fireEvent.press(getByText('Inicia Sesión'));
            
            await waitFor(() => {
                expect(loginUsuario).toHaveBeenCalledWith('javier@test.com', '123456');
            });
        });

        test('llama a onSuccess tras un login correcto', async () => {
            loginUsuario.mockResolvedValueOnce({ 
                success: true, 
                token: 'fake-token',
                usuario: { email: 'javier@test.com' }
            });
            
            const { getByPlaceholderText, getByText } = renderLogin();
            
            fireEvent.changeText(getByPlaceholderText('Email'), 'javier@test.com');
            fireEvent.changeText(getByPlaceholderText('Contraseña'), '123456');
            fireEvent.press(getByText('Inicia Sesión'));
            
            await waitFor(() => {
                expect(mockOnSuccess).toHaveBeenCalled();
            });
        });
    });

    describe('Login fallido', () => {
        test('muestra Alert con el mensaje de error del servidor', async () => {
            loginUsuario.mockRejectedValueOnce({ 
                message: 'Credenciales inválidas' 
            });
            
            const { getByPlaceholderText, getByText } = renderLogin();
            
            fireEvent.changeText(getByPlaceholderText('Email'), 'javier@test.com');
            fireEvent.changeText(getByPlaceholderText('Contraseña'), 'wrongpass');
            fireEvent.press(getByText('Inicia Sesión'));
            
            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    expect.stringContaining('Credenciales inválidas')
                );
            });
        });
    });

    describe('Navegación', () => {
        test('llama a onRegister al pulsar el botón de registro', () => {
            const { getByText } = renderLogin();
            const registerButton = getByText('Crear cuenta');
            fireEvent.press(registerButton);
            expect(mockOnRegister).toHaveBeenCalled();
        });
    });
});