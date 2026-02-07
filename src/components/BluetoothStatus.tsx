import { Bluetooth, BluetoothOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="gradient-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isConnected ? (
            <Bluetooth className="h-5 w-5 text-success" />
          ) : (
            <BluetoothOff className="h-5 w-5 text-muted-foreground" />
          )}
          Bluetooth Connection
        </CardTitle>
        <CardDescription>
          Connect to your Arduino crash detection device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              isConnected
                ? 'bg-success animate-pulse-dot'
                : 'bg-muted-foreground'
            }`}
          />
          <span className="text-sm">
            {isConnected
              ? `Connected to ${deviceName}`
              : isConnecting
              ? 'Connecting...'
              : 'Disconnected'}
          </span>
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </p>
        )}

        <Button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isConnecting}
          variant={isConnected ? 'secondary' : 'default'}
          className="w-full"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : isConnected ? (
            'Disconnect'
          ) : (
            'Connect to Arduino'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
