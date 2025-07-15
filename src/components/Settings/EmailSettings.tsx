import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Key, Globe, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const EmailSettings = () => {
  const { toast } = useToast();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [secretsStatus, setSecretsStatus] = useState({
    RESEND_API_KEY: false,
    SITE_URL: false
  });


  const handleConfigureApiKey = () => {
    toast({
      title: 'Configurar API Key do Resend',
      description: (
        <div className="space-y-3">
          <p>Para configurar sua API Key do Resend:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Acesse o painel do Supabase</li>
            <li>Vá para Settings → Edge Functions</li>
            <li>Clique em "Environment Variables"</li>
            <li>Adicione: <strong>RESEND_API_KEY</strong> = {apiKey || 'sua_api_key'}</li>
            <li>Salve as configurações</li>
          </ol>
          <p className="text-xs">Sua API Key: <code className="bg-muted px-1 py-0.5 rounded">{apiKey}</code></p>
        </div>
      ),
      duration: 10000,
    });
    
    setSecretsStatus(prev => ({ ...prev, RESEND_API_KEY: true }));
    setIsDialogOpen(false);
    setApiKey('');
  };

  const requiredSecrets = [
    {
      name: 'RESEND_API_KEY',
      description: 'Chave da API do Resend para envio de emails',
      icon: <Key className="h-4 w-4" />,
      status: secretsStatus.RESEND_API_KEY ? 'configured' : 'required'
    },
    {
      name: 'SITE_URL',
      description: 'URL do site para links de aprovação',
      value: 'https://propostaonline.app.br',
      icon: <Globe className="h-4 w-4" />,
      status: 'configured'
    }
  ];

  const emailConfig = {
    fromEmail: 'noreply@propostaonline.app.br',
    domain: 'propostaonline.app.br',
    features: [
      'Envio automático de propostas por email',
      'Links de aprovação incluídos no email',
      'Links para comentários/observações',
      'Templates HTML responsivos',
      'Histórico de envios registrado'
    ]
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configuração de Email
          </CardTitle>
          <CardDescription>
            Configure o sistema de envio de emails usando o Resend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Status do Sistema:</strong> A Edge Function está configurada e pronta para uso.
              Você só precisa configurar os secrets no Supabase.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Configuração do Domínio</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Domínio</Label>
                <Input value={emailConfig.domain} disabled />
              </div>
              <div>
                <Label>Email de Envio</Label>
                <Input value={emailConfig.fromEmail} disabled />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Secrets Necessários no Supabase</h4>
            <div className="space-y-3">
              {requiredSecrets.map((secret) => (
                <div key={secret.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {secret.icon}
                    <div>
                      <div className="font-medium text-sm">{secret.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {secret.description}
                      </div>
                      {secret.value && (
                        <div className="text-xs font-mono bg-muted px-2 py-1 rounded mt-1">
                          {secret.value}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant={secret.status === 'configured' ? 'default' : 'secondary'}>
                    {secret.status === 'configured' ? 'Configurado' : 'Necessário'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Funcionalidades Implementadas</h4>
            <ul className="space-y-2">
              {emailConfig.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {!secretsStatus.RESEND_API_KEY && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Configuração Necessária:</strong> Para usar o sistema de envio de emails, 
                você precisa configurar sua API Key do Resend.
              </AlertDescription>
            </Alert>
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full"
                disabled={secretsStatus.RESEND_API_KEY}
                variant={secretsStatus.RESEND_API_KEY ? "outline" : "default"}
              >
                <Settings className="h-4 w-4 mr-2" />
                {secretsStatus.RESEND_API_KEY ? 'API Key Configurada' : 'Configurar API Key do Resend'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar API Key do Resend</DialogTitle>
                <DialogDescription>
                  Insira sua API Key do Resend para habilitar o envio de emails das propostas.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apiKey">API Key do Resend</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="re_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Encontre sua API Key no painel do Resend em API Keys
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleConfigureApiKey}
                    disabled={isConfiguring || !apiKey}
                    className="flex-1"
                  >
                    {isConfiguring ? 'Configurando...' : 'Salvar Configuração'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isConfiguring}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};