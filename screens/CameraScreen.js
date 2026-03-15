import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { usePermission, PERMISSION_STATUS } from '../hooks/usePermissions';

/**
 * CameraScreen
 *
 * Implementa dos flujos de acceso a cámara:
 *   1. CameraView (cámara en vivo con expo-camera)
 *   2. ImagePicker (galería / cámara del sistema con expo-image-picker)
 *
 * Gestión de permisos bajo el principio de mínimo acceso:
 *   - Solo se solicita el permiso cuando el usuario pulsa un botón (no al montar).
 *   - Se manejan los tres estados: granted, denied y blocked.
 */
export default function CameraScreen({ onBack }) {
  // ── Expo-camera: permiso de cámara ──────────────────────────────────────
  const [cameraPermission, requestCameraPermissionExpo] = useCameraPermissions();

  const camPermHook = usePermission(
    async () => {
      const result = await requestCameraPermissionExpo();
      return result; // { granted: bool, canAskAgain: bool, status: string }
    },
    'la cámara'
  );

  // ── Expo-image-picker: permiso de galería ────────────────────────────────
  const galleryPermHook = usePermission(
    async () => {
      const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return result;
    },
    'la galería de fotos'
  );

  // ── Estado local ─────────────────────────────────────────────────────────
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [facing, setFacing] = useState('back');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [pickedImage, setPickedImage] = useState(null);
  const cameraRef = useRef(null);

  // ── Handlers ─────────────────────────────────────────────────────────────

  /** Abre la cámara en vivo tras solicitar permiso */
  const handleOpenLiveCamera = useCallback(async () => {
    if (camPermHook.isGranted || cameraPermission?.granted) {
      setShowLiveCamera(true);
      return;
    }
    if (camPermHook.isBlocked) {
      camPermHook.openSettings();
      return;
    }
    const result = await camPermHook.requestPermission();
    if (result === PERMISSION_STATUS.GRANTED) {
      setShowLiveCamera(true);
    } else if (result === PERMISSION_STATUS.DENIED) {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos acceso a la cámara para tomar fotos. ¿Deseas intentarlo de nuevo?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Intentar de nuevo', onPress: handleOpenLiveCamera },
        ]
      );
    }
  }, [camPermHook, cameraPermission]);

  /** Toma una foto desde la cámara en vivo */
  const handleTakePhoto = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setCapturedPhoto(photo.uri);
      setShowLiveCamera(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta nuevamente.');
      console.error('[CameraScreen] takePicture error:', error);
    }
  }, []);

  /** Abre la galería del sistema tras solicitar permiso */
  const handlePickFromGallery = useCallback(async () => {
    if (galleryPermHook.isBlocked) {
      galleryPermHook.openSettings();
      return;
    }

    let canProceed = galleryPermHook.isGranted;

    if (!canProceed) {
      const result = await galleryPermHook.requestPermission();
      canProceed = result === PERMISSION_STATUS.GRANTED;
    }

    if (!canProceed) {
      if (galleryPermHook.isDenied) {
        Alert.alert(
          'Permiso denegado',
          'No podemos acceder a tu galería sin permiso.',
          [{ text: 'Entendido' }]
        );
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
    }
  }, [galleryPermHook]);

  // ── Vista de cámara en vivo ───────────────────────────────────────────────
  if (showLiveCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowLiveCamera(false)}
            >
              <Text style={styles.cancelBtnText}>✕ Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shutterBtn} onPress={handleTakePhoto}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.flipBtn}
              onPress={() => setFacing(f => (f === 'back' ? 'front' : 'back'))}
            >
              <Text style={styles.flipBtnText}>⟳ Voltear</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // ── Pantalla principal ───────────────────────────────────────────────────
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={{ flexDirection:'row', alignItems:'center', marginBottom:16 }}>
        <Text style={{ fontSize:16, color:'#1976D2', fontWeight:'600' }}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Cámara</Text>
      <Text style={styles.subtitle}>
        Selecciona cómo quieres capturar una imagen
      </Text>

      {/* Estado de permisos */}
      <PermissionBadge label="Permiso cámara" status={camPermHook.status} />
      <PermissionBadge label="Permiso galería" status={galleryPermHook.status} />

      {/* Botones de acción */}
      <View style={styles.actions}>
        <ActionButton
          icon="📷"
          title="Abrir cámara en vivo"
          subtitle="Toma una foto ahora"
          onPress={handleOpenLiveCamera}
          loading={camPermHook.isLoading}
        />
        <ActionButton
          icon="🖼️"
          title="Elegir de galería"
          subtitle="Selecciona una imagen existente"
          onPress={handlePickFromGallery}
          loading={galleryPermHook.isLoading}
        />
      </View>

      {/* Foto capturada con cámara */}
      {capturedPhoto && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Foto capturada</Text>
          <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => setCapturedPhoto(null)}
          >
            <Text style={styles.clearBtnText}>Descartar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Imagen de galería */}
      {pickedImage && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Imagen de galería</Text>
          <Image source={{ uri: pickedImage }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => setPickedImage(null)}
          >
            <Text style={styles.clearBtnText}>Descartar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function PermissionBadge({ label, status }) {
  const config = {
    [PERMISSION_STATUS.IDLE]: { color: '#888', text: 'Sin solicitar', bg: '#f0f0f0' },
    [PERMISSION_STATUS.LOADING]: { color: '#1976D2', text: 'Solicitando…', bg: '#E3F2FD' },
    [PERMISSION_STATUS.GRANTED]: { color: '#2E7D32', text: 'Concedido ✓', bg: '#E8F5E9' },
    [PERMISSION_STATUS.DENIED]: { color: '#E65100', text: 'Denegado', bg: '#FFF3E0' },
    [PERMISSION_STATUS.BLOCKED]: { color: '#B71C1C', text: 'Bloqueado', bg: '#FFEBEE' },
  };
  const c = config[status] ?? config[PERMISSION_STATUS.IDLE];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeLabel, { color: '#555' }]}>{label}</Text>
      <Text style={[styles.badgeStatus, { color: c.color }]}>{c.text}</Text>
    </View>
  );
}

function ActionButton({ icon, title, subtitle, onPress, loading }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#1976D2" />
      ) : (
        <Text style={styles.actionIcon}>{icon}</Text>
      )}
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },

  badge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  badgeLabel: { fontSize: 13, fontWeight: '500' },
  badgeStatus: { fontSize: 13, fontWeight: '600' },

  actions: { marginTop: 16, gap: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  actionIcon: { fontSize: 28 },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  actionSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },

  resultCard: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    padding: 12,
    paddingBottom: 8,
  },
  previewImage: { width: '100%', height: 240, resizeMode: 'cover' },
  clearBtn: { padding: 12, alignItems: 'center' },
  clearBtnText: { color: '#D32F2F', fontSize: 13, fontWeight: '500' },

  // Cámara en vivo
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  cancelBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  flipBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  flipBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});