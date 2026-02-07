import { Button } from '@/components/ui/button';

interface LocationStatusProps {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  isTracking: boolean;
  error: string | null;
  lastUpdated: Date | null;
  onStartTracking: () => void;
  onStopTracking: () => void;
}

export const LocationStatus = ({
  latitude,
  longitude,
  accuracy,
  isTracking,
  error,
  lastUpdated,
  onStartTracking,
  onStopTracking,
}: LocationStatusProps) => {
  return (
    <div className="border border-border p-4 bg-card">
      <h2 className="font-bold mb-2">Location Tracking</h2>
      <p className="text-sm mb-2">Track your location for emergency alerts</p>

      <p className="text-sm mb-2">
        Status: {isTracking && latitude ? '✅ Location active' : isTracking ? '⏳ Getting location...' : '❌ Not tracking'}
      </p>

      {latitude && longitude && (
        <div className="text-sm mb-2 bg-muted p-2">
          <p>📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
          {accuracy && <p>Accuracy: ±{accuracy.toFixed(0)}m</p>}
          {lastUpdated && <p>Updated: {lastUpdated.toLocaleTimeString()}</p>}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive mb-2">{error}</p>
      )}

      <Button
        onClick={isTracking ? onStopTracking : onStartTracking}
        variant={isTracking ? 'secondary' : 'default'}
        className="w-full"
      >
        {isTracking ? 'Stop Tracking' : 'Start Tracking'}
      </Button>
    </div>
  );
};
