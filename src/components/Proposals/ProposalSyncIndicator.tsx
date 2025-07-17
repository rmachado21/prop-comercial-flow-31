import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProposalSyncIndicatorProps {
  isConnected: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onReconnect: () => void;
}

const ProposalSyncIndicator: React.FC<ProposalSyncIndicatorProps> = ({
  isConnected,
  isRefreshing,
  onRefresh,
  onReconnect,
}) => {
  const getStatusInfo = () => {
    if (isRefreshing) {
      return {
        icon: RefreshCw,
        label: 'Sincronizando...',
        variant: 'secondary' as const,
        className: 'text-blue-700 bg-blue-50 border-blue-200',
        iconClassName: 'animate-spin',
      };
    }
    
    if (isConnected) {
      return {
        icon: CheckCircle2,
        label: 'Online',
        variant: 'default' as const,
        className: 'text-green-700 bg-green-50 border-green-200',
        iconClassName: '',
      };
    }
    
    return {
      icon: AlertCircle,
      label: 'Desconectado',
      variant: 'destructive' as const,
      className: 'text-red-700 bg-red-50 border-red-200',
      iconClassName: '',
    };
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <div className="flex items-center gap-3">
      {/* Status Indicator */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={status.variant}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-default',
                status.className
              )}
            >
              <Icon className={cn('w-3 h-3', status.iconClassName)} />
              {status.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">
                {isConnected ? 'Sincronização Ativa' : 'Sincronização Inativa'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isConnected 
                  ? 'As propostas são atualizadas automaticamente'
                  : 'Clique para tentar reconectar ou atualize manualmente'
                }
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {!isConnected && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReconnect}
                  className="h-8 w-8 p-0"
                >
                  <WifiOff className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tentar reconectar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={cn(
                  'w-4 h-4',
                  isRefreshing && 'animate-spin'
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Atualizar manualmente</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ProposalSyncIndicator;