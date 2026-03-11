import { useState, useCallback, useRef, useEffect } from 'react';

interface SerialPortCustom {
  readable: ReadableStream<Uint8Array> | null;
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
}

interface BluetoothState {
  isConnected: boolean;
  isConnecting: boolean;
  deviceName: string | null;
  error: string | null;
  crashDetected: boolean;
}

export const useBluetooth = (onCrashDetected: () => void) => {
  const [state, setState] = useState<BluetoothState>({
    isConnected: false,
    isConnecting: false,
    deviceName: null,
    error: null,
    crashDetected: false,
  });

  const portRef = useRef<SerialPortCustom | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const onCrashDetectedRef = useRef(onCrashDetected);
  const readingRef = useRef(false);

  useEffect(() => {
    onCrashDetectedRef.current = onCrashDetected;
  }, [onCrashDetected]);

  const readLoop = useCallback(async (port: SerialPort) => {
    const decoder = new TextDecoder();
    let buffer = '';

    while (port.readable && readingRef.current) {
      const reader = port.readable.getReader();
      readerRef.current = reader;

      try {
        while (readingRef.current) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete lines (Arduino sends data ending with \n)
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            console.log('HC-06 received:', trimmed);

            // Check for crash signal - Arduino sends "CRASH" or "1"
            if (trimmed === 'CRASH' || trimmed === '1') {
              setState(prev => ({ ...prev, crashDetected: true }));
              onCrashDetectedRef.current();

              setTimeout(() => {
                setState(prev => ({ ...prev, crashDetected: false }));
              }, 5000);
            }
          }
        }
      } catch (error) {
        if (readingRef.current) {
          console.error('Read error:', error);
        }
      } finally {
        reader.releaseLock();
      }
    }
  }, []);

  const connectToDevice = useCallback(async () => {
    if (!('serial' in navigator)) {
      setState(prev => ({
        ...prev,
        error: 'Web Serial API not supported. Use Chrome or Edge. Make sure HC-06 is paired with your computer first.',
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Request a serial port - user picks the HC-06 from the list
      const port = await (navigator as any).serial.requestPort();
      portRef.current = port;

      // HC-06 default baud rate is 9600
      await port.open({ baudRate: 9600 });

      readingRef.current = true;

      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        deviceName: 'HC-06 (Serial)',
        error: null,
      }));

      // Start reading data from Arduino
      readLoop(port);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, [readLoop]);

  const disconnect = useCallback(async () => {
    readingRef.current = false;

    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (e) {
        // ignore
      }
      readerRef.current = null;
    }

    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch (e) {
        // ignore
      }
      portRef.current = null;
    }

    setState({
      isConnected: false,
      isConnecting: false,
      deviceName: null,
      error: null,
      crashDetected: false,
    });
  }, []);

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
