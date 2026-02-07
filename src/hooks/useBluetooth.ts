import { useState, useCallback, useRef, useEffect } from 'react';

interface BluetoothState {
  isConnected: boolean;
  isConnecting: boolean;
  deviceName: string | null;
  error: string | null;
  crashDetected: boolean;
}

// Common Arduino BLE Service UUIDs - adjust these to match your Arduino's configuration
const ARDUINO_SERVICE_UUID = '19b10000-e8f2-537e-4f6c-d104768a1214';
const CRASH_CHARACTERISTIC_UUID = '19b10001-e8f2-537e-4f6c-d104768a1214';

interface BluetoothDeviceCustom {
  name?: string;
  gatt?: BluetoothRemoteGATTServerCustom;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface BluetoothRemoteGATTServerCustom {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServerCustom>;
  disconnect(): void;
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTServiceCustom>;
}

interface BluetoothRemoteGATTServiceCustom {
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristicCustom>;
}

interface BluetoothRemoteGATTCharacteristicCustom {
  value?: DataView;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristicCustom>;
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristicCustom>;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface RequestDeviceOptions {
  filters?: Array<{
    services?: string[];
    namePrefix?: string;
    name?: string;
  }>;
  optionalServices?: string[];
  acceptAllDevices?: boolean;
}

interface NavigatorBluetooth {
  requestDevice(options: RequestDeviceOptions): Promise<BluetoothDeviceCustom>;
}

declare global {
  interface Navigator {
    bluetooth?: NavigatorBluetooth;
  }
}

export const useBluetooth = (onCrashDetected: () => void) => {
  const [state, setState] = useState<BluetoothState>({
    isConnected: false,
    isConnecting: false,
    deviceName: null,
    error: null,
    crashDetected: false,
  });

  const deviceRef = useRef<BluetoothDeviceCustom | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristicCustom | null>(null);
  const onCrashDetectedRef = useRef(onCrashDetected);

  useEffect(() => {
    onCrashDetectedRef.current = onCrashDetected;
  }, [onCrashDetected]);

  const handleCrashNotification = useCallback((event: Event) => {
    const target = event.target as unknown as BluetoothRemoteGATTCharacteristicCustom;
    const value = target.value;
    
    if (value) {
      const crashSignal = value.getUint8(0);
      // Assuming 1 = crash detected, 0 = no crash
      if (crashSignal === 1) {
        setState(prev => ({ ...prev, crashDetected: true }));
        onCrashDetectedRef.current();
        
        // Reset crash state after 5 seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, crashDetected: false }));
        }, 5000);
      }
    }
  }, []);

  const connectToDevice = useCallback(async () => {
    if (!navigator.bluetooth) {
      setState(prev => ({
        ...prev,
        error: 'Web Bluetooth is not supported in this browser. Please use Chrome or Edge.',
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Request device with Arduino BLE service
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [ARDUINO_SERVICE_UUID] },
          { namePrefix: 'Arduino' },
          { namePrefix: 'Crash' },
        ],
        optionalServices: [ARDUINO_SERVICE_UUID],
      });

      deviceRef.current = device;

      // Handle disconnection
      device.addEventListener('gattserverdisconnected', () => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          deviceName: null,
          crashDetected: false,
        }));
        characteristicRef.current = null;
      });

      // Connect to GATT server
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }

      // Get the crash detection service
      const service = await server.getPrimaryService(ARDUINO_SERVICE_UUID);
      
      // Get the crash characteristic
      const characteristic = await service.getCharacteristic(CRASH_CHARACTERISTIC_UUID);
      characteristicRef.current = characteristic;

      // Start notifications for crash detection
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleCrashNotification);

      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        deviceName: device.name || 'Unknown Device',
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, [handleCrashNotification]);

  const disconnect = useCallback(() => {
    if (characteristicRef.current) {
      characteristicRef.current.removeEventListener(
        'characteristicvaluechanged',
        handleCrashNotification
      );
    }

    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }

    setState({
      isConnected: false,
      isConnecting: false,
      deviceName: null,
      error: null,
      crashDetected: false,
    });
  }, [handleCrashNotification]);

  const simulateCrash = useCallback(() => {
    setState(prev => ({ ...prev, crashDetected: true }));
    onCrashDetectedRef.current();
    
    setTimeout(() => {
      setState(prev => ({ ...prev, crashDetected: false }));
    }, 5000);
  }, []);

  return {
    ...state,
    connectToDevice,
    disconnect,
    simulateCrash,
  };
};
