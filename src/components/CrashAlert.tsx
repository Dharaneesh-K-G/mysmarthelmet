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
    <div className="border-2 border-border p-4 bg-card">
      <h2 className="font-bold text-xl mb-2">
        {crashDetected ? '🚨 CRASH DETECTED!' : alertSent ? '✅ Alert Sent' : '👁️ Monitoring'}
      </h2>
      
      <p className="text-sm mb-4">
        {crashDetected
          ? isSendingAlert
            ? 'Sending emergency alerts...'
            : 'Emergency alert triggered!'
          : alertSent
          ? 'Your contacts have been notified.'
          : isConnected
          ? 'Waiting for crash signal from Arduino...'
          : 'Connect your Arduino to begin monitoring.'}
      </p>

      {alertError && (
        <p className="text-sm text-destructive mb-2">Error: {alertError}</p>
      )}

      <Button
        variant="outline"
        className="w-full"
        onClick={onSimulateCrash}
        disabled={isSendingAlert}
      >
        ⚡ Simulate Crash (Test)
      </Button>
      <p className="text-xs text-muted-foreground mt-1">
        Use this to test the alert system
      </p>
    </div>
  );
};
