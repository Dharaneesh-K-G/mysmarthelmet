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
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <header className="border-b border-border pb-4 mb-6">
        <h1 className="text-2xl font-bold">CrashGuard</h1>
        <p className="text-sm text-muted-foreground">Emergency Alert System</p>
        <p className="text-xs mt-1">
          Status: {bluetooth.isConnected ? '🟢 Connected' : '⚪ Not Connected'}
        </p>
      </header>

      {/* Main Content */}
      <main className="space-y-6 max-w-xl">
        {/* Crash Alert Status */}
        <CrashAlert
          crashDetected={bluetooth.crashDetected}
          isConnected={bluetooth.isConnected}
          isSendingAlert={isSendingAlert}
          alertSent={alertSent}
          alertError={alertError}
          onSimulateCrash={bluetooth.simulateCrash}
        />

        {/* Bluetooth */}
        <BluetoothStatus
          isConnected={bluetooth.isConnected}
          isConnecting={bluetooth.isConnecting}
          deviceName={bluetooth.deviceName}
          error={bluetooth.error}
          onConnect={bluetooth.connectToDevice}
          onDisconnect={bluetooth.disconnect}
        />

        {/* Location */}
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

        {/* Contacts */}
        <ContactsList
          contacts={contacts}
          onAddContact={addContact}
          onRemoveContact={removeContact}
        />

        {/* Email Settings */}
        <EmailSettings />

        {/* Footer */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>Keep the app open for crash detection.</p>
          <p>HC-06 Baud Rate: 9600 | Arduino sends "CRASH" or "1" to trigger alert</p>
        </div>
      </main>
    </div>
  );
};

export default Index;
