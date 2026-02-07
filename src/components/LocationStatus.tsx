import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="gradient-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Navigation className="h-5 w-5 text-accent" />
          Location Tracking
        </CardTitle>
        <CardDescription>
          Track your live location for emergency alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              isTracking && latitude
                ? 'bg-success animate-pulse-dot'
                : isTracking
                ? 'bg-accent animate-pulse'
                : 'bg-muted-foreground'
            }`}
          />
          <span className="text-sm">
            {isTracking && latitude
              ? 'Location active'
              : isTracking
              ? 'Acquiring location...'
              : 'Not tracking'}
          </span>
        </div>

        {latitude && longitude && (
          <div className="bg-secondary/50 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-accent" />
              <span className="font-mono text-xs">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </span>
            </div>
            {accuracy && (
              <p className="text-xs text-muted-foreground">
                Accuracy: ±{accuracy.toFixed(0)}m
              </p>
            )}
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </p>
        )}

        <Button
          onClick={isTracking ? onStopTracking : onStartTracking}
          variant={isTracking ? 'secondary' : 'default'}
          className="w-full"
        >
          {isTracking ? (
            latitude ? (
              'Stop Tracking'
            ) : (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Acquiring...
              </>
            )
          ) : (
            'Start Tracking'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
