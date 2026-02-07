import { useState, useCallback, useEffect } from 'react';
import { Shield, Activity } from 'lucide-react';
import { useBluetooth } from '@/hooks/useBluetooth';
import { useLocation } from '@/hooks/useLocation';
import { useContacts } from '@/hooks/useContacts';
import { sendEmergencyEmail, isEmailConfigured } from '@/services/emailService';
import { BluetoothStatus } from '@/components/BluetoothStatus';
import { LocationStatus } from '@/components/LocationStatus';
import { ContactsList } from '@/components/ContactsList';
import { CrashAlert } from '@/components/CrashAlert';
import { EmailSettings } from '@/components/EmailSettings';
import { toast } from 'sonner';

const Index = () => {
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [alertError, setAlertError] = useState<string | null>(null);

  const { contacts, addContact, removeContact } = useContacts();
  const location = useLocation();

  const handleCrashDetected = useCallback(async () => {
    if (!isEmailConfigured()) {
      toast.error('EmailJS not configured. Please set up email settings first.');
      setAlertError('EmailJS not configured');
      return;
    }

    if (contacts.length === 0) {
      toast.error('No emergency contacts. Please add at least one contact.');
      setAlertError('No emergency contacts');
      return;
    }

    if (!location.latitude || !location.longitude) {
      toast.error('Location not available. Please enable location tracking.');
      setAlertError('Location not available');
      return;
    }

    setIsSendingAlert(true);
    setAlertError(null);
    setAlertSent(false);

    const locationLink = location.getGoogleMapsLink() || '';

    const result = await sendEmergencyEmail(
      contacts,
      locationLink,
      location.latitude,
      location.longitude
    );

    setIsSendingAlert(false);

    if (result.success) {
      setAlertSent(true);
      toast.success('Emergency alerts sent to all contacts!');
      
      // Reset alert sent status after 10 seconds
      setTimeout(() => setAlertSent(false), 10000);
    } else {
      setAlertError(result.error || 'Failed to send alerts');
      toast.error(result.error || 'Failed to send emergency alerts');
    }
  }, [contacts, location]);

  const bluetooth = useBluetooth(handleCrashDetected);

  // Auto-start location tracking when app loads
  useEffect(() => {
    location.startTracking();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-emergency flex items-center justify-center shadow-glow">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">CrashGuard</h1>
              <p className="text-xs text-muted-foreground">Emergency Alert System</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Activity className={`h-4 w-4 ${bluetooth.isConnected ? 'text-success animate-pulse' : 'text-muted-foreground'}`} />
              <span className="text-xs text-muted-foreground">
                {bluetooth.isConnected ? 'Active' : 'Standby'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Crash Alert Status */}
        <CrashAlert
          crashDetected={bluetooth.crashDetected}
          isConnected={bluetooth.isConnected}
          isSendingAlert={isSendingAlert}
          alertSent={alertSent}
          alertError={alertError}
          onSimulateCrash={bluetooth.simulateCrash}
        />

        {/* Status Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <BluetoothStatus
            isConnected={bluetooth.isConnected}
            isConnecting={bluetooth.isConnecting}
            deviceName={bluetooth.deviceName}
            error={bluetooth.error}
            onConnect={bluetooth.connectToDevice}
            onDisconnect={bluetooth.disconnect}
          />

          <LocationStatus
            latitude={location.latitude}
            longitude={location.longitude}
            accuracy={location.accuracy}
            isTracking={location.isTracking}
            error={location.error}
            lastUpdated={location.lastUpdated}
            onStartTracking={location.startTracking}
            onStopTracking={location.stopTracking}
          />
        </div>

        {/* Contacts */}
        <ContactsList
          contacts={contacts}
          onAddContact={addContact}
          onRemoveContact={removeContact}
        />

        {/* Email Settings */}
        <EmailSettings />

        {/* Footer Info */}
        <div className="text-center pb-8">
          <p className="text-xs text-muted-foreground">
            Keep the app open and location enabled for automatic crash detection.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Arduino should use BLE service UUID: <code className="font-mono text-accent">19b10000-e8f2-537e-4f6c-d104768a1214</code>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
