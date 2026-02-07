import { useState, useEffect, useCallback } from 'react';

export interface Contact {
  id: string;
  name: string;
  email: string;
}

const STORAGE_KEY = 'crash-alert-contacts';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setContacts(JSON.parse(stored));
      } catch {
        console.error('Failed to parse stored contacts');
      }
    }
  }, []);

  const saveContacts = useCallback((newContacts: Contact[]) => {
    setContacts(newContacts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newContacts));
  }, []);

  const addContact = useCallback((name: string, email: string) => {
    const newContact: Contact = {
      id: crypto.randomUUID(),
      name,
      email,
    };
    saveContacts([...contacts, newContact]);
  }, [contacts, saveContacts]);

  const removeContact = useCallback((id: string) => {
    saveContacts(contacts.filter(c => c.id !== id));
  }, [contacts, saveContacts]);

  const updateContact = useCallback((id: string, name: string, email: string) => {
    saveContacts(
      contacts.map(c => (c.id === id ? { ...c, name, email } : c))
    );
  }, [contacts, saveContacts]);

  return {
    contacts,
    addContact,
    removeContact,
    updateContact,
  };
};
