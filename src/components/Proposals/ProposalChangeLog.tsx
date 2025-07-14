import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Edit, Plus, Trash2, MessageCircle } from 'lucide-react';
import { ProposalChange } from '@/hooks/useProposalChanges';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProposalChangeLogProps {
  changes: ProposalChange[];
  isLoading: boolean;
  lastUpdated?: string;
}

const ProposalChangeLog: React.FC<ProposalChangeLogProps> = ({ 
  changes, 
  isLoading, 
  lastUpdated 
}) => {
  const getChangeIcon = (changeType: string, fieldName?: string) => {
    // Special icon for client comments
    if (fieldName === 'observacoes_cliente') {
      return <MessageCircle className="w-4 h-4 text-blue-600" />;
    }
    
    switch (changeType) {
      case 'create':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'update':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case 'create':
        return 'Criado';
      case 'update':
        return 'Atualizado';
      case 'delete':
        return 'Removido';
      default:
        return 'Alterado';
    }
  };

  const getFieldLabel = (field: string) => {
    const fieldLabels: { [key: string]: string } = {
      'client_id': 'Cliente',
      'validity_days': 'Validade',
      'discount_percentage': 'Desconto',
      'notes': 'Observações',
      'terms_and_conditions': 'Termos e Condições',
      'subtotal': 'Subtotal',
      'total_amount': 'Valor Total',
      'status': 'Status',
      'title': 'Título',
      'description': 'Descrição',
      'observacoes_cliente': 'Observações do Cliente',
    };
    return fieldLabels[field] || field;
  };

  const formatValue = (value: string | null) => {
    if (!value) return '-';
    
    // Check if it's a number (price)
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && value.includes('.')) {
      return `R$ ${numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    
    // Check if it's a percentage
    if (value.includes('%')) {
      return value;
    }
    
    return value.length > 50 ? `${value.substring(0, 50)}...` : value;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Histórico de Alterações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Histórico de Alterações
        </CardTitle>
        {lastUpdated && (
          <p className="text-sm text-muted-foreground">
            Última atualização: {formatDistanceToNow(new Date(lastUpdated), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {changes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma alteração registrada ainda.
          </p>
        ) : (
          <div className="space-y-4">
            {changes.map((change) => (
              <div key={change.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex-shrink-0 mt-1">
                  {getChangeIcon(change.change_type, change.field_name)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      change.field_name === 'observacoes_cliente' ? 'outline' :
                      change.change_type === 'create' ? 'default' : 
                      change.change_type === 'update' ? 'secondary' : 'destructive'
                    }>
                      {change.field_name === 'observacoes_cliente' ? 'Observações do Cliente' : getChangeTypeLabel(change.change_type)}
                    </Badge>
                    <span className="text-sm font-medium">
                      {getFieldLabel(change.field_name)}
                    </span>
                  </div>
                  
                  {change.change_type === 'update' && (
                    <div className="text-sm text-muted-foreground">
                      {change.field_name === 'observacoes_cliente' ? (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-blue-800 font-medium">Observações do Cliente:</p>
                          <p className="text-blue-700 mt-1">{change.new_value}</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span>De:</span>
                            <code className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
                              {formatValue(change.old_value)}
                            </code>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span>Para:</span>
                            <code className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                              {formatValue(change.new_value)}
                            </code>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  {change.change_type === 'create' && (
                    <div className="text-sm text-muted-foreground">
                      <span>Valor:</span>
                      <code className="ml-2 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                        {formatValue(change.new_value)}
                      </code>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(change.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProposalChangeLog;