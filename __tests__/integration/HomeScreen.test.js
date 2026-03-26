// __tests__/integration/HomeScreen.test.js
import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import HomeScreen from '../../screens/HomeScreen';
import { obtenerPerfil, logout } from '../../services/authService';

// Mock de Alert
jest.spyOn(Alert, 'alert');

jest.mock('../../services/authService', () => ({
    obtenerPerfil: jest.fn(),
    logout: jest.fn(),
}));

describe('HomeScreen — Pruebas de Integración', () => {
    const mockOnLogout = jest.fn();
    const mockOnNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        Alert.alert.mockClear();
    });

    const renderHome = () => {
        return render(
            <HomeScreen 
                onLogout={mockOnLogout}
                onNavigate={mockOnNavigate}
            />
        );
    };

    describe('Carga de perfil', () => {
        test('muestra el nombre del usuario', async () => {
            // Mock de datos de usuario
            const mockUsuario = {
                nombre: 'María',
                email: 'maria@test.com',
                rol: 'Usuario',
                activo: true
            };
            
            // Configurar el mock para que resuelva inmediatamente
            obtenerPerfil.mockImplementation(() => {
                console.log('obtenerPerfil fue llamado');
                return Promise.resolve({
                    success: true,
                    usuario: mockUsuario
                });
            });
            
            const { getByText, queryByText, debug } = renderHome();
            
            // Debug: ver el estado inicial
            console.log('Estado inicial después de render:');
            debug();
            
            // Esperar a que aparezca el nombre
            await waitFor(() => {
                const nombreElement = queryByText('María');
                if (!nombreElement) {
                    console.log('No se encontró "María". Estado actual:');
                    debug();
                }
                expect(nombreElement).toBeTruthy();
            }, {
                timeout: 15000,
                interval: 1000
            });
            
            // Verificar que se llamó al servicio
            expect(obtenerPerfil).toHaveBeenCalledTimes(1);
        }, 20000); // Timeout de la prueba aumentado a 20 segundos
    });
});