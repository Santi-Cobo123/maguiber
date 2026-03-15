import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { usePermission, PERMISSION_STATUS } from '../hooks/usePermissions';

/**
 * LocationScreen
 *
 * Implementa geolocalización con:
 *   - Ubicación puntual (getCurrentPositionAsync)
 *   - Seguimiento en tiempo real (watchPositionAsync)
 *
 * Principio de mínimo acceso:
 *   - Solo se solicita permiso FOREGROUND (no background) porque no se
 *     necesita ubicación mientras la app está en segundo plano.
 *   - El permiso se pide únicamente cuando el usuario pulsa un botón.
 *   - Se manejan granted, denied y blocked con mensajes claros.
 */
export default function LocationScreen({ onBack }) {
  // ── Permiso de ubicación (foreground solamente) ──────────────────────────
  const locationPermHook = usePermission(
    async () => {
      const result = await Location.requestForegroundPermissionsAsync();
      return result; // { status: 'granted'|'denied', canAskAgain: bool }
    },
    'la ubicación'
  );

  // ── Estado local ─────────────────────────────────────────────────────────
  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [watchSubscription, setWatchSubscription] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Verifica/solicita permiso antes de usar GPS */
  const ensurePermission = useCallback(async () => {
    // Si ya está concedido, continúa
    if (locationPermHook.isGranted) return true;

    // Si está bloqueado, redirige a ajustes
    if (locationPermHook.isBlocked) {
      locationPermHook.openSettings();
      return false;
    }

    // Solicita el permiso
    const result = await locationPermHook.requestPermission();

    if (result === PERMISSION_STATUS.DENIED) {
      Alert.alert(
        'Permiso denegado',
        'La app necesita acceso a tu ubicación para mostrar tu posición. Puedes concederlo en cualquier momento.',
        [
          { text: 'No ahora', style: 'cancel' },
          { text: 'Volver a pedir', onPress: ensurePermission },
        ]
      );
      return false;
    }

    return result === PERMISSION_STATUS.GRANTED;
  }, [locationPermHook]);

  /** Convierte coordenadas a dirección legible */
  const reverseGeocode = useCallback(async (lat, lon) => {
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (place) {
        const parts = [place.street, place.district, place.city, place.country].filter(Boolean);
        return parts.join(', ');
      }
    } catch {
      // Geocodificación inversa es opcional; no interrumpir el flujo
    }
    return null;
  }, []);

  // ── Obtener ubicación puntual ─────────────────────────────────────────────
  const handleGetCurrentLocation = useCallback(async () => {
    const ok = await ensurePermission();
    if (!ok) return;

    setIsLoadingLocation(true);
    setCurrentLocation(null);
    setAddress(null);

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Equilibrio batería / precisión
      });

      const { latitude, longitude, altitude, accuracy } = loc.coords;
      setCurrentLocation({ latitude, longitude, altitude, accuracy, timestamp: loc.timestamp });

      const addr = await reverseGeocode(latitude, longitude);
      setAddress(addr);
    } catch (error) {
      Alert.alert('Error de GPS', 'No se pudo obtener tu ubicación. Verifica que el GPS esté activo.');
      console.error('[LocationScreen] getCurrentPosition error:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [ensurePermission, reverseGeocode]);

  // ── Seguimiento en tiempo real ────────────────────────────────────────────
  const handleToggleWatch = useCallback(async () => {
    if (isWatching) {
      // Detener seguimiento y liberar recursos
      watchSubscription?.remove();
      setWatchSubscription(null);
      setIsWatching(false);
      return;
    }

    const ok = await ensurePermission();
    if (!ok) return;

    try {
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 3000,   // mínimo 3 s entre actualizaciones
          distanceInterval: 10, // o 10 m de distancia recorrida
        },
        (loc) => {
          const { latitude, longitude, accuracy } = loc.coords;
          const entry = { latitude, longitude, accuracy, timestamp: loc.timestamp };
          setCurrentLocation(entry);
          setLocationHistory(prev => [entry, ...prev].slice(0, 10)); // últimas 10
        }
      );
      setWatchSubscription(sub);
      setIsWatching(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar el seguimiento de ubicación.');
      console.error('[LocationScreen] watchPosition error:', error);
    }
  }, [isWatching, watchSubscription, ensurePermission]);

  const handleClearHistory = useCallback(() => {
    setLocationHistory([]);
    setCurrentLocation(null);
    setAddress(null);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
   <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={{ flexDirection:'row', alignItems:'center', marginBottom:16 }}>
        <Text style={{ fontSize:16, color:'#1976D2', fontWeight:'600' }}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Geolocalización</Text>
      <Text style={styles.subtitle}>Acceso a tu posición en tiempo real</Text>

      {/* Estado del permiso */}
      <PermissionCard status={locationPermHook.status} onOpenSettings={locationPermHook.openSettings} />

      {/* Botones de acción */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={handleGetCurrentLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>📍 Obtener ubicación actual</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, isWatching ? styles.btnDanger : styles.btnSecondary]}
          onPress={handleToggleWatch}
          disabled={locationPermHook.isLoading}
        >
          <Text style={[styles.btnText, isWatching && { color: '#fff' }]}>
            {isWatching ? '⏹ Detener seguimiento' : '▶ Iniciar seguimiento en vivo'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Resultado de ubicación actual */}
      {currentLocation && (
        <LocationCard location={currentLocation} address={address} isLive={isWatching} />
      )}

      {/* Historial de seguimiento */}
      {locationHistory.length > 1 && (
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Historial de ruta ({locationHistory.length})</Text>
            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={styles.clearText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
          {locationHistory.map((loc, i) => (
            <View key={loc.timestamp} style={[styles.historyRow, i === 0 && styles.historyRowLatest]}>
              <Text style={styles.historyIndex}>{i === 0 ? '●' : `${i + 1}`}</Text>
              <Text style={styles.historyCoords}>
                {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
              </Text>
              <Text style={styles.historyTime}>
                {new Date(loc.timestamp).toLocaleTimeString('es-EC')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function PermissionCard({ status, onOpenSettings }) {
  const config = {
    [PERMISSION_STATUS.IDLE]: {
      bg: '#F5F5F5', color: '#757575',
      icon: '🔒', text: 'El permiso de ubicación aún no se ha solicitado.',
    },
    [PERMISSION_STATUS.LOADING]: {
      bg: '#E3F2FD', color: '#1565C0',
      icon: '⏳', text: 'Solicitando permiso de ubicación…',
    },
    [PERMISSION_STATUS.GRANTED]: {
      bg: '#E8F5E9', color: '#2E7D32',
      icon: '✅', text: 'Permiso concedido. El GPS está disponible.',
    },
    [PERMISSION_STATUS.DENIED]: {
      bg: '#FFF3E0', color: '#E65100',
      icon: '⚠️', text: 'Permiso denegado. Puedes volver a solicitarlo.',
    },
    [PERMISSION_STATUS.BLOCKED]: {
      bg: '#FFEBEE', color: '#B71C1C',
      icon: '🚫', text: 'Permiso bloqueado. Habilítalo en Configuración del dispositivo.',
    },
  };

  const c = config[status] ?? config[PERMISSION_STATUS.IDLE];

  return (
    <View style={[styles.permCard, { backgroundColor: c.bg }]}>
      <Text style={styles.permIcon}>{c.icon}</Text>
      <View style={styles.permBody}>
        <Text style={[styles.permText, { color: c.color }]}>{c.text}</Text>
        {status === PERMISSION_STATUS.BLOCKED && (
          <TouchableOpacity onPress={onOpenSettings}>
            <Text style={styles.permLink}>Abrir Configuración →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function LocationCard({ location, address, isLive }) {
  return (
    <View style={styles.locationCard}>
      {isLive && (
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN VIVO</Text>
        </View>
      )}
      <Text style={styles.locationTitle}>Tu ubicación</Text>

      {address && <Text style={styles.locationAddress}>{address}</Text>}

      <View style={styles.coordGrid}>
        <CoordRow label="Latitud" value={location.latitude.toFixed(7)} unit="°" />
        <CoordRow label="Longitud" value={location.longitude.toFixed(7)} unit="°" />
        {location.altitude != null && (
          <CoordRow label="Altitud" value={Math.round(location.altitude)} unit="m" />
        )}
        {location.accuracy != null && (
          <CoordRow label="Precisión" value={Math.round(location.accuracy)} unit="m" />
        )}
      </View>

      <Text style={styles.timestamp}>
        Actualizado: {new Date(location.timestamp).toLocaleTimeString('es-EC')}
      </Text>
    </View>
  );
}

function CoordRow({ label, value, unit }) {
  return (
    <View style={styles.coordRow}>
      <Text style={styles.coordLabel}>{label}</Text>
      <Text style={styles.coordValue}>
        {value}
        <Text style={styles.coordUnit}> {unit}</Text>
      </Text>
    </View>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },

  permCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  permIcon: { fontSize: 20, marginTop: 1 },
  permBody: { flex: 1 },
  permText: { fontSize: 13, lineHeight: 18 },
  permLink: { color: '#1976D2', fontSize: 13, marginTop: 6, fontWeight: '500' },

  actions: { gap: 12, marginBottom: 24 },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  btnPrimary: { backgroundColor: '#1976D2' },
  btnPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  btnSecondary: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#1976D2' },
  btnDanger: { backgroundColor: '#D32F2F' },
  btnText: { color: '#1976D2', fontWeight: '600', fontSize: 15 },

  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  liveDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#D32F2F',
  },
  liveText: { fontSize: 11, fontWeight: '700', color: '#D32F2F', letterSpacing: 1 },
  locationTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  locationAddress: { fontSize: 13, color: '#666', marginBottom: 14, lineHeight: 18 },
  coordGrid: { gap: 8, marginBottom: 14 },
  coordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  coordLabel: { fontSize: 13, color: '#888' },
  coordValue: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  coordUnit: { fontWeight: '400', color: '#888' },
  timestamp: { fontSize: 11, color: '#aaa', textAlign: 'right' },

  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  clearText: { fontSize: 13, color: '#D32F2F' },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  historyRowLatest: { backgroundColor: '#F1F8FF', borderRadius: 8, paddingHorizontal: 8, borderTopWidth: 0, marginBottom: 4 },
  historyIndex: { fontSize: 12, color: '#1976D2', width: 18, textAlign: 'center', fontWeight: '700' },
  historyCoords: { flex: 1, fontSize: 12, color: '#333', fontFamily: 'monospace' },
  historyTime: { fontSize: 11, color: '#999' },
});