import emailjs from '@emailjs/browser';
import { Contact } from '@/hooks/useContacts';

// EmailJS Configuration - User needs to set these up
const EMAILJS_SERVICE_ID = 'service_crash_alert'; // User's EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'template_crash_alert'; // User's EmailJS template ID
const EMAILJS_PUBLIC_KEY = ''; // User's EmailJS public key - will be set via settings

interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

const CONFIG_STORAGE_KEY = 'crash-alert-emailjs-config';

export const getEmailConfig = (): EmailConfig | null => {
  const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

export const saveEmailConfig = (config: EmailConfig): void => {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
};

export const isEmailConfigured = (): boolean => {
  const config = getEmailConfig();
  return !!(config?.serviceId && config?.templateId && config?.publicKey);
};

export const sendEmergencyEmail = async (
  contacts: Contact[],
  locationLink: string,
  latitude: number,
  longitude: number
): Promise<{ success: boolean; error?: string }> => {
  const config = getEmailConfig();
  
  if (!config?.publicKey) {
    return { success: false, error: 'EmailJS not configured. Please set up EmailJS in settings.' };
  }

  if (contacts.length === 0) {
    return { success: false, error: 'No emergency contacts configured.' };
  }

  try {
    // Initialize EmailJS
    emailjs.init(config.publicKey);

    // Send email to each contact
    const emailPromises = contacts.map(contact =>
      emailjs.send(config.serviceId, config.templateId, {
        to_name: contact.name,
        to_email: contact.email,
        location_link: locationLink,
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
        timestamp: new Date().toLocaleString(),
        message: `EMERGENCY ALERT: A crash has been detected! The victim's current location is: ${locationLink}`,
      })
    );

    await Promise.all(emailPromises);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send emails';
    console.error('Email sending failed:', error);
    return { success: false, error: errorMessage };
  }
};
