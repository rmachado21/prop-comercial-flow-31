
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface ClientSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ value, onChange }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  useEffect(() => {
    if (value && clients.length > 0) {
      const client = clients.find(c => c.id === value);
      setSelectedClient(client || null);
    }
  }, [value, clients]);

  const fetchClients = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, phone')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (client: Client) => {
    setSelectedClient(client);
    onChange(client.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <div
        className="flex items-center justify-between w-full px-3 py-2 border border-commercial-200 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedClient ? "text-commercial-900" : "text-commercial-400"}>
          {selectedClient ? selectedClient.name : "Selecione um cliente"}
        </span>
        <Search className="w-4 h-4 text-commercial-400" />
      </div>

      {isOpen && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />

              <div className="max-h-60 overflow-y-auto space-y-1">
                {filteredClients.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-commercial-600 mb-3">
                      {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsOpen(false);
                        // Here you could open a client creation modal
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Cliente
                    </Button>
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                        value === client.id 
                          ? 'bg-primary-50 border border-primary-200' 
                          : 'hover:bg-commercial-50'
                      }`}
                      onClick={() => handleSelect(client)}
                    >
                      <div>
                        <p className="font-medium text-commercial-900">{client.name}</p>
                        {client.email && (
                          <p className="text-sm text-commercial-600">{client.email}</p>
                        )}
                      </div>
                      {value === client.id && (
                        <Check className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientSelector;
