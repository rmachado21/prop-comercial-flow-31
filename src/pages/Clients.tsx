
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import ClientForm from '@/components/Clients/ClientForm';
import DeleteClientDialog from '@/components/Clients/DeleteClientDialog';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  cnpj?: string;
  ie?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const Clients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Fetch clients
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user?.id
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Cliente excluído",
        description: "Cliente foi excluído com sucesso.",
      });
      setDeletingClient(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir cliente",
        description: error.message,
      });
    }
  });

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleDelete = (client: Client) => {
    setDeletingClient(client);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cnpj?.includes(searchTerm)
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar clientes</h1>
            <p className="text-commercial-600">Por favor, tente novamente mais tarde.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-commercial-900">Clientes</h1>
            <p className="text-commercial-600 mt-2">
              Gerencie sua base de clientes
            </p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="mt-4 sm:mt-0 bg-gradient-primary hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-commercial-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome, email ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lista de Clientes ({filteredClients.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-commercial-600 mt-2">Carregando clientes...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-commercial-600">
                  {searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsFormOpen(true)}
                    variant="outline"
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Primeiro Cliente
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-commercial-900">{client.name}</p>
                            {client.contact_name && (
                              <p className="text-sm text-commercial-600">
                                Contato: {client.contact_name}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {client.email && (
                              <div className="flex items-center text-sm text-commercial-600">
                                <Mail className="w-3 h-3 mr-1" />
                                {client.email}
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center text-sm text-commercial-600">
                                <Phone className="w-3 h-3 mr-1" />
                                {client.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {client.cnpj && (
                              <p className="text-sm text-commercial-900">{client.cnpj}</p>
                            )}
                            {client.ie && (
                              <p className="text-xs text-commercial-600">IE: {client.ie}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(client.city || client.state) && (
                            <div className="flex items-center text-sm text-commercial-600">
                              <MapPin className="w-3 h-3 mr-1" />
                              {client.city && client.state ? `${client.city}, ${client.state}` : (client.city || client.state)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(client)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(client)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client Form Dialog */}
      <ClientForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        client={editingClient}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteClientDialog
        client={deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={() => deletingClient && deleteClientMutation.mutate(deletingClient.id)}
        isLoading={deleteClientMutation.isPending}
      />
    </div>
  );
};

export default Clients;
