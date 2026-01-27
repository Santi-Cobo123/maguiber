import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { registroUsuario } from '../services/authService';

export default function RegisterScreen({ onSuccess, onBack }) {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [confirmarContraseña, setConfirmarContraseña] = useState('');
    const [loading, setLoading] = useState(false);

    const manejarRegistro = async () => {
        if (!nombre.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu nombre');
            return;
        }
        if (!email.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu email');
            return;
        }
        if (!contraseña.trim()) {
            Alert.alert('Error', 'Por favor ingresa una contraseña');
            return;
        }
        if (contraseña.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (contraseña !== confirmarContraseña) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            const response = await registroUsuario(nombre, email, contraseña, 2);
            if (response.success) {
                Alert.alert('Éxito', 'Usuario registrado correctamente');
                onSuccess();
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.textoVolver}>← Volver</Text>
                </TouchableOpacity>

                <Text style={styles.titulo}>Crear Cuenta</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Nombre completo"
                    value={nombre}
                    onChangeText={setNombre}
                    editable={!loading}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
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

                <TextInput
                    style={styles.input}
                    placeholder="Confirmar contraseña"
                    secureTextEntry
                    value={confirmarContraseña}
                    onChangeText={setConfirmarContraseña}
                    editable={!loading}
                />

                <TouchableOpacity
                    style={[styles.boton, loading && styles.botonDeshabilitado]}
                    onPress={manejarRegistro}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.textoBoton}>Registrarse</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    content: { padding: 20, paddingTop: 20 },
    textoVolver: { fontSize: 14, color: '#007AFF', fontWeight: '600', marginBottom: 20 },
    titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
    input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
    boton: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 20 },
    botonDeshabilitado: { opacity: 0.6 },
    textoBoton: { color: '#fff', fontSize: 16, fontWeight: '600' },
});