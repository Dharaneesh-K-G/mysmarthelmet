import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="border border-border p-4 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold">Emergency Contacts</h2>
        <Button size="sm" variant="outline" onClick={() => setIsAdding(!isAdding)}>
          + Add
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        People who will be notified if an accident occurs
      </p>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-muted p-3 mb-4">
          <div className="mb-2">
            <label className="text-sm block mb-1">Name:</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Mom"
            />
          </div>
          <div className="mb-2">
            <label className="text-sm block mb-1">Email:</label>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g., mom@email.com"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">Add Contact</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {contacts.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-sm">No contacts added yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between bg-muted p-2">
              <div>
                <p className="font-medium text-sm">{contact.name}</p>
                <p className="text-xs text-muted-foreground">{contact.email}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveContact(contact.id)}
              >
                🗑️
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
