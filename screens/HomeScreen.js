import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView
} from 'react-native';
import { obtenerPerfil, logout } from '../services/authService';

export default function HomeScreen({ onLogout, onNavigate }) {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logoutLoading, setLogoutLoading] = useState(false);

    useEffect(() => {
        cargarPerfil();
    }, []);

    const cargarPerfil = async () => {
        try {
            const data = await obtenerPerfil();
            if (data.success) {
                setUsuario(data.usuario);
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudo cargar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const manejarLogout = async () => {
        setLogoutLoading(true);
        try {
            await logout();
            onLogout();
        } catch (error) {
            Alert.alert('Error', 'Error al cerrar sesión');
        } finally {
            setLogoutLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centrado}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.bienvenida}>¡Bienvenido!</Text>
                    <Text style={styles.nombre}>{usuario?.nombre}</Text>
                </View>

                <View style={styles.tarjeta}>
                    <View style={styles.fila}>
                        <Text style={styles.label}>📧 Email:</Text>
                        <Text style={styles.valor}>{usuario?.email}</Text>
                    </View>

                    <View style={styles.divisor} />

                    <View style={styles.fila}>
                        <Text style={styles.label}>👤 Rol:</Text>
                        <View style={styles.rolBadge}>
                            <Text style={styles.rolTexto}>{usuario?.rol}</Text>
                        </View>
                    </View>

                    <View style={styles.divisor} />

                    <View style={styles.fila}>
                        <Text style={styles.label}>✅ Estado:</Text>
                        <Text style={[styles.valor, { color: '#34C759' }]}>
                            {usuario?.activo ? 'Activo' : 'Inactivo'}
                        </Text>
                    </View>
                </View>

                {/* ── Funcionalidades Nativas ── */}
                <View style={styles.nativasPanel}>
                    <Text style={styles.tituloPanel}>📱 Funcionalidades del dispositivo</Text>
                    <TouchableOpacity
                        style={styles.botonNativa}
                        onPress={() => onNavigate('camera')}
                    >
                        <Text style={styles.botonNativaIcono}>📷</Text>
                        <View style={styles.botonNativaTextos}>
                            <Text style={styles.botonNativaTitulo}>Cámara</Text>
                            <Text style={styles.botonNativaSubtitulo}>Tomar fotos o elegir de galería</Text>
                        </View>
                        <Text style={styles.flecha}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.botonNativa}
                        onPress={() => onNavigate('location')}
                    >
                        <Text style={styles.botonNativaIcono}>📍</Text>
                        <View style={styles.botonNativaTextos}>
                            <Text style={styles.botonNativaTitulo}>Geolocalización</Text>
                            <Text style={styles.botonNativaSubtitulo}>Ver tu ubicación en tiempo real</Text>
                        </View>
                        <Text style={styles.flecha}>›</Text>
                    </TouchableOpacity>
                </View>

                {usuario?.rol === 'Admin' && (
                    <View style={styles.adminPanel}>
                        <Text style={styles.tituloPanel}>Panel de Administrador</Text>
                        <TouchableOpacity style={styles.botonPanel}>
                            <Text style={styles.textoBotonPanel}>📊 Ver Estadísticas</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.botonPanel}>
                            <Text style={styles.textoBotonPanel}>👥 Gestionar Usuarios</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {usuario?.rol === 'Usuario' && (
                    <View style={styles.usuarioPanel}>
                        <Text style={styles.tituloPanel}>Mi Zona de Usuario</Text>
                        <TouchableOpacity style={styles.botonPanel}>
                            <Text style={styles.textoBotonPanel}>📝 Mi Perfil</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.botonLogout, logoutLoading && styles.botonDeshabilitado]}
                    onPress={manejarLogout}
                    disabled={logoutLoading}
                >
                    {logoutLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.textoBotonLogout}>🚪 Cerrar Sesión</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
        paddingTop: 40,
    },
    header: {
        marginBottom: 30,
    },
    bienvenida: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    nombre: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    tarjeta: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    fila: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    valor: {
        fontSize: 14,
        color: '#666',
    },
    rolBadge: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    rolTexto: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    divisor: {
        height: 1,
        backgroundColor: '#eee',
    },
    nativasPanel: {
        backgroundColor: '#F0F4FF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#3D5AFE',
    },
    botonNativa: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    botonNativaIcono: {
        fontSize: 24,
    },
    botonNativaTextos: {
        flex: 1,
    },
    botonNativaTitulo: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A2E',
    },
    botonNativaSubtitulo: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    flecha: {
        fontSize: 22,
        color: '#999',
    },
    adminPanel: {
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },
    usuarioPanel: {
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    tituloPanel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    botonPanel: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
    },
    textoBotonPanel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    botonLogout: {
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    botonDeshabilitado: {
        opacity: 0.6,
    },
    textoBotonLogout: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});