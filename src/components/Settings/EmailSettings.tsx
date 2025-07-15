import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Mail, Key, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const EmailSettings = () => {
  const { toast } = useToast();
  const [isConfiguring, setIsConfiguring] = useState(false);

  const handleConfigureSecrets = () => {
    toast({
      title: 'Configuração de Secrets',
      description: 'Acesse o painel do Supabase para configurar as chaves de API necessárias.',
    });
  };

  const requiredSecrets = [
    {
      name: 'RESEND_API_KEY',
      description: 'Chave da API do Resend para envio de emails',
      icon: <Key className="h-4 w-4" />,
      status: 'required'
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

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Próximos Passos:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Acesse o painel do Supabase</li>
                <li>Vá para a seção "Settings" → "Secrets"</li>
                <li>Adicione a secret <code>RESEND_API_KEY</code> com sua chave do Resend</li>
                <li>Confirme que <code>SITE_URL</code> está configurada como <code>https://propostaonline.app.br</code></li>
                <li>Teste o envio de uma proposta</li>
              </ol>
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleConfigureSecrets}
            className="w-full"
            disabled={isConfiguring}
          >
            {isConfiguring ? 'Configurando...' : 'Abrir Documentação do Supabase'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};