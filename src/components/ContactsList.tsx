import { useState } from 'react';
import { Users, Plus, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Contact } from '@/hooks/useContacts';

interface ContactsListProps {
  contacts: Contact[];
  onAddContact: (name: string, email: string) => void;
  onRemoveContact: (id: string) => void;
}

export const ContactsList = ({
  contacts,
  onAddContact,
  onRemoveContact,
}: ContactsListProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newEmail.trim()) {
      onAddContact(newName.trim(), newEmail.trim());
      setNewName('');
      setNewEmail('');
      setIsAdding(false);
    }
  };

  return (
    <Card className="gradient-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Emergency Contacts
            </CardTitle>
            <CardDescription>
              Family members who will be notified in case of an accident
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-secondary/50 p-4 rounded-lg space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Mom"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g., mom@email.com"
                className="bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1">
                Add Contact
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {contacts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No emergency contacts added</p>
            <p className="text-xs">Add contacts to receive alerts</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.email}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveContact(contact.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
