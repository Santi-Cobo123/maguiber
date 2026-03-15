import { useState, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';

/**
 * Estados de permiso normalizados
 * - idle      : aún no se ha solicitado
 * - granted   : el usuario concedió acceso
 * - denied    : el usuario rechazó (se puede volver a pedir)
 * - blocked   : el usuario lo bloqueó permanentemente (solo Settings)
 * - loading   : solicitud en curso
 */
export const PERMISSION_STATUS = {
  IDLE: 'idle',
  GRANTED: 'granted',
  DENIED: 'denied',
  BLOCKED: 'blocked',
  LOADING: 'loading',
};

/**
 * Hook genérico para gestión de permisos bajo el principio de mínimo acceso.
 * Recibe una función `requestFn` que devuelve el resultado de la librería
 * (expo-camera, expo-location, etc.) y lo normaliza a PERMISSION_STATUS.
 *
 * @param {Function} requestFn  - Función que llama a la API de permisos nativa
 * @param {string}   permName   - Nombre legible del permiso (para los mensajes)
 */
export function usePermission(requestFn, permName = 'este recurso') {
  const [status, setStatus] = useState(PERMISSION_STATUS.IDLE);

  /**
   * Normaliza la respuesta de expo-permissions/expo-location/expo-camera
   * al enum PERMISSION_STATUS.
   */
  const normalize = useCallback((result) => {
    // expo-camera / expo-location devuelven { status: 'granted'|'denied' }
    // Algunos plugins también devuelven { granted: bool, canAskAgain: bool }
    const rawStatus =
      typeof result === 'string'
        ? result
        : result?.status ?? (result?.granted ? 'granted' : 'denied');

    const canAskAgain = result?.canAskAgain ?? true;

    if (rawStatus === 'granted') return PERMISSION_STATUS.GRANTED;
    if (!canAskAgain || rawStatus === 'blocked') return PERMISSION_STATUS.BLOCKED;
    return PERMISSION_STATUS.DENIED;
  }, []);

  /**
   * Solicita el permiso de forma diferida (solo cuando el usuario
   * realiza una acción concreta — principio de mínimo acceso).
   */
  const requestPermission = useCallback(async () => {
    setStatus(PERMISSION_STATUS.LOADING);
    try {
      const result = await requestFn();
      const normalized = normalize(result);
      setStatus(normalized);
      return normalized;
    } catch (error) {
      console.error(`[usePermission] Error solicitando ${permName}:`, error);
      setStatus(PERMISSION_STATUS.DENIED);
      return PERMISSION_STATUS.DENIED;
    }
  }, [requestFn, normalize, permName]);

  /**
   * Abre Configuración del sistema cuando el permiso está bloqueado.
   * El usuario debe habilitarlo manualmente.
   */
  const openSettings = useCallback(() => {
    Alert.alert(
      'Permiso bloqueado',
      `El acceso a ${permName} fue bloqueado. Habilítalo manualmente en Configuración.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ir a Configuración', onPress: () => Linking.openSettings() },
      ]
    );
  }, [permName]);

  return {
    status,
    isIdle: status === PERMISSION_STATUS.IDLE,
    isLoading: status === PERMISSION_STATUS.LOADING,
    isGranted: status === PERMISSION_STATUS.GRANTED,
    isDenied: status === PERMISSION_STATUS.DENIED,
    isBlocked: status === PERMISSION_STATUS.BLOCKED,
    requestPermission,
    openSettings,
    setStatus,
  };
}