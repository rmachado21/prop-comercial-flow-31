import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Users, FileText, Building, Package, TrendingUp, Settings } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  company: string | null;
  created_at: string;
  role: 'super_admin' | 'user';
  proposals_count: number;
  clients_count: number;
  products_count: number;
}

interface SystemStats {
  total_users: number;
  total_proposals: number;
  total_clients: number;
  total_products: number;
  total_companies: number;
}

const Admin: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isSuperAdmin } = useRole();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState('');

  const fetchUsers = async () => {
    try {
      if (!user) return;

      // Super admins podem ver todos os usuários, usuários normais só seus próprios dados
      if (isSuperAdmin) {
        // Otimizar query para super admins usando uma única query com JOIN
        const { data: usersWithCounts, error } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            email,
            company,
            created_at,
            user_roles!inner(role),
            proposals:proposals(count),
            clients:clients(count),
            products:products(count)
          `);

        if (error) throw error;

        const formattedUsers = usersWithCounts.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          company: user.company,
          created_at: user.created_at,
          role: user.user_roles[0]?.role || 'user',
          proposals_count: user.proposals[0]?.count || 0,
          clients_count: user.clients[0]?.count || 0,
          products_count: user.products[0]?.count || 0,
        }));

        setUsers(formattedUsers);
      } else {
        // Usuários normais só veem seus próprios dados
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, email, company, created_at')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleError) throw roleError;

        // Contar dados próprios do usuário
        const [proposalsCount, clientsCount, productsCount] = await Promise.all([
          supabase.from('proposals').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('clients').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('products').select('id', { count: 'exact' }).eq('user_id', user.id)
        ]);

        setUsers([{
          ...profile,
          role: roleData?.role || 'user',
          proposals_count: proposalsCount.count || 0,
          clients_count: clientsCount.count || 0,
          products_count: productsCount.count || 0,
        }]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive",
      });
    }
  };

  const fetchStats = async () => {
    try {
      if (!user) return;

      if (isSuperAdmin) {
        // Super admins veem estatísticas globais
        const [usersCount, proposalsCount, clientsCount, productsCount, companiesCount] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('proposals').select('id', { count: 'exact' }),
          supabase.from('clients').select('id', { count: 'exact' }),
          supabase.from('products').select('id', { count: 'exact' }),
          supabase.from('companies').select('id', { count: 'exact' })
        ]);

        setStats({
          total_users: usersCount.count || 0,
          total_proposals: proposalsCount.count || 0,
          total_clients: clientsCount.count || 0,
          total_products: productsCount.count || 0,
          total_companies: companiesCount.count || 0,
        });
      } else {
        // Usuários normais veem apenas suas próprias estatísticas
        const [proposalsCount, clientsCount, productsCount, companiesCount] = await Promise.all([
          supabase.from('proposals').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('clients').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('products').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('companies').select('id', { count: 'exact' }).eq('user_id', user.id)
        ]);

        setStats({
          total_users: 1, // Apenas o próprio usuário
          total_proposals: proposalsCount.count || 0,
          total_clients: clientsCount.count || 0,
          total_products: productsCount.count || 0,
          total_companies: companiesCount.count || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas",
        variant: "destructive",
      });
    }
  };

  const promoteToSuperAdmin = async () => {
    if (!selectedUserEmail) {
      toast({
        title: "Erro",
        description: "Digite o email do usuário",
        variant: "destructive",
      });
      return;
    }

    try {
      const user = users.find(u => u.email === selectedUserEmail);
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'super_admin'
        }, {
          onConflict: 'user_id,role'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${user.name} foi promovido a Super Admin`,
      });

      setSelectedUserEmail('');
      fetchUsers();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível promover o usuário",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-commercial-900 mb-2">
            {isSuperAdmin ? 'Admin Dashboard' : 'Meu Dashboard'}
          </h1>
          <p className="text-commercial-600">
            {isSuperAdmin ? 'Gerencie usuários e monitore o sistema' : 'Monitore suas informações'}
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Propostas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_proposals}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_clients}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_products}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_companies}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Promote User Section - Apenas para Super Admins */}
        {isSuperAdmin && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Promover Usuário a Super Admin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Email do usuário..."
                  value={selectedUserEmail}
                  onChange={(e) => setSelectedUserEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={promoteToSuperAdmin}>
                  Promover
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle>{isSuperAdmin ? 'Gerenciamento de Usuários' : 'Minhas Informações'}</CardTitle>
            {isSuperAdmin && (
              <div className="flex justify-between items-center">
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.company && (
                          <p className="text-sm text-muted-foreground">{user.company}</p>
                        )}
                      </div>
                      <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'}>
                        {user.role === 'super_admin' ? 'Super Admin' : 'Usuário'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="text-center">
                      <div className="font-medium">{user.proposals_count}</div>
                      <div>Propostas</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{user.clients_count}</div>
                      <div>Clientes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{user.products_count}</div>
                      <div>Produtos</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;