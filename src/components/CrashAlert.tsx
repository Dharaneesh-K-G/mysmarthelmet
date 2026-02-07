import { AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CrashAlertProps {
  crashDetected: boolean;
  isConnected: boolean;
  isSendingAlert: boolean;
  alertSent: boolean;
  alertError: string | null;
  onSimulateCrash: () => void;
}

export const CrashAlert = ({
  crashDetected,
  isConnected,
  isSendingAlert,
  alertSent,
  alertError,
  onSimulateCrash,
}: CrashAlertProps) => {
  return (
    <div className="relative">
      {/* Alert Status Display */}
      <div
        className={`relative overflow-hidden rounded-2xl p-8 text-center transition-all duration-500 ${
          crashDetected
            ? 'gradient-emergency shadow-emergency'
            : alertSent
            ? 'bg-success/20 border border-success'
            : 'bg-secondary border border-border'
        }`}
      >
        {/* Pulse rings when crash detected */}
        {crashDetected && (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-white/30 animate-pulse-ring" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-white/50 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
            </div>
          </>
        )}

        <div className="relative z-10">
          <div
            className={`mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center ${
              crashDetected
                ? 'bg-white/20 animate-pulse-dot'
                : alertSent
                ? 'bg-success/30'
                : 'bg-muted'
            }`}
          >
            <AlertTriangle
              className={`h-10 w-10 ${
                crashDetected
                  ? 'text-white'
                  : alertSent
                  ? 'text-success'
                  : 'text-muted-foreground'
              }`}
            />
          </div>

          <h2
            className={`text-2xl font-bold mb-2 ${
              crashDetected ? 'text-white' : ''
            }`}
          >
            {crashDetected
              ? 'CRASH DETECTED!'
              : alertSent
              ? 'Alert Sent Successfully'
              : 'Monitoring Active'}
          </h2>

          <p
            className={`text-sm ${
              crashDetected
                ? 'text-white/80'
                : alertSent
                ? 'text-success'
                : 'text-muted-foreground'
            }`}
          >
            {crashDetected
              ? isSendingAlert
                ? 'Sending emergency alerts to your contacts...'
                : 'Emergency alert triggered!'
              : alertSent
              ? 'Your emergency contacts have been notified with your location.'
              : isConnected
              ? 'Waiting for crash signal from Arduino...'
              : 'Connect your Arduino to begin monitoring.'}
          </p>

          {alertError && (
            <p className="mt-3 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {alertError}
            </p>
          )}
        </div>
      </div>

      {/* Test Button */}
      <div className="mt-4">
        <Button
          variant="outline"
          className="w-full border-dashed border-accent/50 text-accent hover:bg-accent/10"
          onClick={onSimulateCrash}
          disabled={isSendingAlert}
        >
          <Zap className="mr-2 h-4 w-4" />
          Simulate Crash (Test)
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Use this to test the emergency alert system
        </p>
      </div>
    </div>
  );
};
