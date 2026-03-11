import { Button } from '@/components/ui/button';

interface BluetoothStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  deviceName: string | null;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const BluetoothStatus = ({
  isConnected,
  isConnecting,
  deviceName,
  error,
  onConnect,
  onDisconnect,
}: BluetoothStatusProps) => {
  return (
    <div className="border border-border p-4 bg-card">
      <h2 className="font-bold mb-2">Serial Connection</h2>
      <p className="text-sm mb-2">Connect to HC-06 (pair it with your PC first via Bluetooth settings)</p>
      
      <p className="text-sm mb-2">
        Status: {isConnected ? `✅ Connected to ${deviceName}` : isConnecting ? '⏳ Connecting...' : '❌ Disconnected'}
      </p>

      {error && (
        <p className="text-sm text-destructive mb-2">{error}</p>
      )}

      <Button
        onClick={isConnected ? onDisconnect : onConnect}
        disabled={isConnecting}
        className="w-full"
      >
        {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect to HC-06'}
      </Button>
    </div>
  );
};
