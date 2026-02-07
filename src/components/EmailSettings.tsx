import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getEmailConfig, saveEmailConfig, isEmailConfigured } from '@/services/emailService';
import { toast } from 'sonner';

export const EmailSettings = () => {
  const existingConfig = getEmailConfig();
  const [serviceId, setServiceId] = useState(existingConfig?.serviceId || '');
  const [templateId, setTemplateId] = useState(existingConfig?.templateId || '');
  const [publicKey, setPublicKey] = useState(existingConfig?.publicKey || '');
  const [isOpen, setIsOpen] = useState(!isEmailConfigured());

  const handleSave = () => {
    if (!serviceId || !templateId || !publicKey) {
      toast.error('Please fill in all EmailJS configuration fields');
      return;
    }

    saveEmailConfig({ serviceId, templateId, publicKey });
    toast.success('EmailJS configuration saved!');
    setIsOpen(false);
  };

  if (!isOpen && isEmailConfigured()) {
    return (
      <div className="border border-border p-4 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold">✅ EmailJS Configured</h2>
            <p className="text-sm text-muted-foreground">Email alerts are ready</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}>
            Edit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border p-4 bg-card">
      <h2 className="font-bold mb-2">⚙️ EmailJS Configuration</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Set up EmailJS to send emergency emails.{' '}
        <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="underline">
          Get keys here
        </a>
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-sm block mb-1">Service ID:</label>
          <Input
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            placeholder="service_xxxxxxx"
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Template ID:</label>
          <Input
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            placeholder="template_xxxxxxx"
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Public Key:</label>
          <Input
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder="Your EmailJS public key"
          />
        </div>

        <div className="bg-muted p-2 text-xs">
          <p><strong>Template variables needed:</strong></p>
          <p>{'{{name}}'} - Contact name</p>
          <p>{'{{to_email}}'} - Contact email</p>
          <p>{'{{message}}'} - Emergency message with location</p>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
