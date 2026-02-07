import { useState } from 'react';
import { Settings, Save, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
      <Card className="gradient-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-success" />
                EmailJS Configured
              </CardTitle>
              <CardDescription>
                Email alerts are ready to send
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOpen(true)}
            >
              Edit
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border border-accent/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-accent" />
          EmailJS Configuration
        </CardTitle>
        <CardDescription>
          Set up EmailJS to send emergency emails.{' '}
          <a
            href="https://www.emailjs.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline inline-flex items-center gap-1"
          >
            Get your keys from EmailJS
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="serviceId">Service ID</Label>
          <Input
            id="serviceId"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            placeholder="service_xxxxxxx"
            className="bg-background font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="templateId">Template ID</Label>
          <Input
            id="templateId"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            placeholder="template_xxxxxxx"
            className="bg-background font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publicKey">Public Key</Label>
          <Input
            id="publicKey"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder="Your EmailJS public key"
            className="bg-background font-mono text-sm"
          />
        </div>

        <div className="bg-secondary/50 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Template variables:</strong> Your EmailJS template should use:
          </p>
          <ul className="text-xs text-muted-foreground mt-1 space-y-0.5 font-mono">
            <li>{'{{name}}'} - Contact name</li>
            <li>{'{{to_email}}'} - Contact email</li>
            <li>{'{{message}}'} - Emergency message with location</li>
          </ul>
        </div>

        <Button onClick={handleSave} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
};
