import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SecuritySettings: React.FC = () => {
  const openSupabaseAuth = () => {
    window.open('https://supabase.com/dashboard/project/brhqvrkvezsdithiegzu/auth/providers', '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Configurações Pendentes no Supabase:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Configurar tempo de expiração do OTP para valor recomendado (10 minutos)</li>
                <li>Habilitar proteção contra senhas vazadas</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Configurações de Autenticação</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Acesse o painel do Supabase para configurar as opções de segurança.
            </p>
            <Button onClick={openSupabaseAuth} variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Configurações do Supabase
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600 mb-2">✅ Segurança Implementada</h4>
              <ul className="text-sm space-y-1">
                <li>• Isolamento de dados por usuário</li>
                <li>• RLS policies configuradas</li>
                <li>• Funções com search_path seguro</li>
                <li>• Validação de permissões no frontend</li>
                <li>• Dashboard restrito por role</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-blue-600 mb-2">🔧 Otimizações Aplicadas</h4>
              <ul className="text-sm space-y-1">
                <li>• Queries N+1 resolvidas</li>
                <li>• Uso de JOINs otimizado</li>
                <li>• Cache de validações de role</li>
                <li>• Validação de acesso automática</li>
                <li>• Logs de segurança</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;