import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Building2, Upload, Download, Save, Loader2, ArrowLeft, Shield } from 'lucide-react';
import * as XLSX from 'xlsx';


interface Company {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  logo_url: string;
}

const CompanySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [company, setCompany] = useState<Company>({
    id: '',
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    logo_url: '',
  });

  useEffect(() => {
    if (user) {
      loadCompanyData();
    }
  }, [user]);

  const loadCompanyData = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCompany(data);
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const companyData = {
        ...company,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (company.id) {
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', company.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('companies')
          .insert(companyData)
          .select()
          .single();

        if (error) throw error;
        setCompany(data);
      }

      toast({
        title: 'Sucesso',
        description: 'Informações da empresa salvas com sucesso!',
      });
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar informações da empresa',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      setCompany(prev => ({ ...prev, logo_url: data.publicUrl }));

      toast({
        title: 'Sucesso',
        description: 'Logo enviado com sucesso!',
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar logo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleBackup = async () => {
    try {
      // Get all data from user
      const [proposalsRes, clientsRes, productsRes] = await Promise.all([
        supabase.from('proposals').select('*').eq('user_id', user?.id),
        supabase.from('clients').select('*').eq('user_id', user?.id),
        supabase.from('products').select('*').eq('user_id', user?.id),
      ]);

      const workbook = XLSX.utils.book_new();

      // Add company data
      const companySheet = XLSX.utils.json_to_sheet([company]);
      XLSX.utils.book_append_sheet(workbook, companySheet, 'Empresa');

      // Add proposals
      if (proposalsRes.data) {
        const proposalsSheet = XLSX.utils.json_to_sheet(proposalsRes.data);
        XLSX.utils.book_append_sheet(workbook, proposalsSheet, 'Propostas');
      }

      // Add clients
      if (clientsRes.data) {
        const clientsSheet = XLSX.utils.json_to_sheet(clientsRes.data);
        XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Clientes');
      }

      // Add products
      if (productsRes.data) {
        const productsSheet = XLSX.utils.json_to_sheet(productsRes.data);
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Produtos');
      }

      XLSX.writeFile(workbook, `backup_${company.name || 'empresa'}_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: 'Sucesso',
        description: 'Backup gerado com sucesso!',
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar backup',
        variant: 'destructive',
      });
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;

    // Validações
    if (!passwordForm.currentPassword) {
      toast({
        title: 'Erro',
        description: 'Senha atual é obrigatória',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'Nova senha deve ter pelo menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'Confirmação de senha não confere',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ser diferente da atual',
        variant: 'destructive',
      });
      return;
    }

    setChangingPassword(true);
    try {
      // Primeiro verifica a senha atual fazendo uma tentativa de login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: passwordForm.currentPassword,
      });

      if (signInError) {
        toast({
          title: 'Erro',
          description: 'Senha atual incorreta',
          variant: 'destructive',
        });
        return;
      }

      // Atualiza a senha
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      // Limpa o formulário
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast({
        title: 'Sucesso',
        description: 'Senha alterada com sucesso!',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar senha',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Configurações da Empresa</h1>
          </div>
        </div>
        <Button onClick={handleBackup} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Backup (.xlsx)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    value={company.name}
                    onChange={(e) => setCompany(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={company.cnpj}
                    onChange={(e) => setCompany(prev => ({ ...prev, cnpj: e.target.value }))}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={company.email}
                    onChange={(e) => setCompany(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={company.phone}
                    onChange={(e) => setCompany(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={company.website}
                  onChange={(e) => setCompany(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.empresa.com"
                />
              </div>
              
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  value={company.address}
                  onChange={(e) => setCompany(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Rua, número, complemento"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={company.city}
                    onChange={(e) => setCompany(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={company.state}
                    onChange={(e) => setCompany(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="SP"
                  />
                </div>
                <div>
                  <Label htmlFor="zip_code">CEP</Label>
                  <Input
                    id="zip_code"
                    value={company.zip_code}
                    onChange={(e) => setCompany(prev => ({ ...prev, zip_code: e.target.value }))}
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.logo_url && (
                <div className="flex justify-center">
                  <img
                    src={company.logo_url}
                    alt="Logo da empresa"
                    className="max-w-32 max-h-32 object-contain border rounded"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="logo">Enviar Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Senha Atual *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Digite sua senha atual"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Nova Senha *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Digite a nova senha (mín. 6 caracteres)"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirme a nova senha"
                />
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="w-full"
                variant="outline"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Alterando Senha...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Button
            onClick={handleSave}
            disabled={saving || !company.name}
            className="w-full"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;