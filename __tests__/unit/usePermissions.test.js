import { renderHook, act } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import { usePermission, PERMISSION_STATUS } from '../../hooks/usePermissions';

jest.spyOn(Alert, 'alert').mockImplementation(() => {});
jest.spyOn(Linking, 'openSettings').mockImplementation(() => Promise.resolve());

describe('usePermissions — Pruebas Unitarias', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Estado inicial', () => {
    test('inicia en estado idle', () => {
      const { result } = renderHook(() => usePermission(jest.fn(), 'la cámara'));
      expect(result.current.status).toBe(PERMISSION_STATUS.IDLE);
      expect(result.current.isIdle).toBe(true);
    });

    test('no llama a la función de permiso al montar', () => {
      const mockFn = jest.fn();
      renderHook(() => usePermission(mockFn, 'la cámara'));
      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe('Estado granted', () => {
    test('cambia a granted cuando el usuario concede el permiso', async () => {
      const mockFn = jest.fn().mockResolvedValue({ status: 'granted', canAskAgain: true });
      const { result } = renderHook(() => usePermission(mockFn, 'la cámara'));
      await act(async () => { await result.current.requestPermission(); });
      expect(result.current.isGranted).toBe(true);
    });

    test('reconoce granted cuando viene como { granted: true }', async () => {
      const mockFn = jest.fn().mockResolvedValue({ granted: true, canAskAgain: true });
      const { result } = renderHook(() => usePermission(mockFn, 'la cámara'));
      await act(async () => { await result.current.requestPermission(); });
      expect(result.current.isGranted).toBe(true);
    });
  });

  describe('Estado denied', () => {
    test('cambia a denied cuando el usuario rechaza', async () => {
      const mockFn = jest.fn().mockResolvedValue({ status: 'denied', canAskAgain: true });
      const { result } = renderHook(() => usePermission(mockFn, 'la cámara'));
      await act(async () => { await result.current.requestPermission(); });
      expect(result.current.isDenied).toBe(true);
    });
  });

  describe('Estado blocked', () => {
    test('cambia a blocked cuando canAskAgain es false', async () => {
      const mockFn = jest.fn().mockResolvedValue({ status: 'denied', canAskAgain: false });
      const { result } = renderHook(() => usePermission(mockFn, 'la cámara'));
      await act(async () => { await result.current.requestPermission(); });
      expect(result.current.isBlocked).toBe(true);
    });

    test('openSettings muestra Alert cuando el permiso está bloqueado', async () => {
      const mockFn = jest.fn().mockResolvedValue({ status: 'denied', canAskAgain: false });
      const { result } = renderHook(() => usePermission(mockFn, 'la cámara'));
      await act(async () => { await result.current.requestPermission(); });
      act(() => { result.current.openSettings(); });
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permiso bloqueado',
        expect.stringContaining('la cámara'),
        expect.any(Array)
      );
    });
  });

  describe('Manejo de errores', () => {
    test('cambia a denied si la función lanza una excepción', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Error de hardware'));
      const { result } = renderHook(() => usePermission(mockFn, 'la cámara'));
      await act(async () => { await result.current.requestPermission(); });
      expect(result.current.status).toBe(PERMISSION_STATUS.DENIED);
    });
  });
});