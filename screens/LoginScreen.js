import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView
} from 'react-native';
import { loginUsuario } from '../services/authService';

export default function LoginScreen({ onSuccess, onRegister }) {
    const [email, setEmail] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [loading, setLoading] = useState(false);

    const manejarLogin = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu email');
            return;
        }
        if (!contraseña.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu contraseña');
            return;
        }

        setLoading(true);
        try {
            const response = await loginUsuario(email, contraseña);

            if (response.success) {
                Alert.alert('Éxito', 'Sesión iniciada correctamente');
                onSuccess();
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.titulo}>Iniciar Sesión</Text>
                <Text style={styles.subtitulo}>Sistema de Registro con Roles</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    secureTextEntry
                    value={contraseña}
                    onChangeText={setContraseña}
                    editable={!loading}
                />

                <TouchableOpacity
                    style={[styles.boton, loading && styles.botonDeshabilitado]}
                    onPress={manejarLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.textoBoton}>Inicia Sesión</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.divider}>
                    <Text style={styles.textoRegistro}>¿No tienes cuenta?</Text>
                </View>

                <TouchableOpacity
                    style={styles.botonRegistro}
                    onPress={onRegister}
                >
                    <Text style={styles.textoBotonRegistro}>Crear cuenta</Text>
                </TouchableOpacity>

                <View style={styles.datosPrueba}>
                    <Text style={styles.labelPrueba}>📝 Datos de prueba:</Text>
                    <Text style={styles.textoPrueba}>Email: admin@test.com</Text>
                    <Text style={styles.textoPrueba}>Contraseña: 123456</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
        paddingTop: 80,
    },
    titulo: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        color: '#333',
    },
    subtitulo: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 14,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    boton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    botonDeshabilitado: {
        opacity: 0.6,
    },
    textoBoton: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        marginTop: 30,
        marginBottom: 20,
    },
    textoRegistro: {
        color: '#666',
        textAlign: 'center',
        fontSize: 14,
    },
    botonRegistro: {
        backgroundColor: '#34C759',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },
    textoBotonRegistro: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    datosPrueba: {
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
        padding: 15,
        marginTop: 30,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    labelPrueba: {
        fontWeight: '600',
        fontSize: 14,
        color: '#2E7D32',
        marginBottom: 8,
    },
    textoPrueba: {
        fontSize: 13,
        color: '#558B2F',
        marginBottom: 4,
        fontFamily: 'monospace',
    },
});