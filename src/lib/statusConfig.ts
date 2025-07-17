export const statusConfig = {
  draft: { label: 'Rascunho', variant: 'secondary' as const },
  sent: { label: 'Enviada', variant: 'default' as const },
  approved: { label: 'Aprovada', variant: 'success' as const },
  rejected: { label: 'Rejeitada', variant: 'destructive' as const },
  expired: { label: 'Expirada', variant: 'outline' as const },
  nfe_issued: { label: 'NF-e Emitida', variant: 'success' as const },
  contested: { label: 'Contestada', variant: 'warning' as const },
};

export const getStatusLabel = (status: string) => {
  return statusConfig[status as keyof typeof statusConfig]?.label || status;
};

export const getStatusVariant = (status: string) => {
  return statusConfig[status as keyof typeof statusConfig]?.variant || 'outline';
};

export const getStatusConfig = (status: string) => {
  const statusOptions = {
    'draft': { 
      label: 'Rascunho', 
      bgClass: 'bg-[hsl(var(--status-draft))]',
      textClass: 'text-[hsl(var(--status-draft-foreground))]'
    },
    'sent': { 
      label: 'Enviada', 
      bgClass: 'bg-[hsl(var(--status-sent))]',
      textClass: 'text-[hsl(var(--status-sent-foreground))]'
    },
    'approved': { 
      label: 'Aprovada', 
      bgClass: 'bg-[hsl(var(--status-approved))]',
      textClass: 'text-[hsl(var(--status-approved-foreground))]'
    },
    'rejected': { 
      label: 'Cancelada', 
      bgClass: 'bg-[hsl(var(--status-rejected))]',
      textClass: 'text-[hsl(var(--status-rejected-foreground))]'
    },
    'expired': { 
      label: 'Expirada', 
      bgClass: 'bg-[hsl(var(--status-expired))]',
      textClass: 'text-[hsl(var(--status-expired-foreground))]'
    },
    'nfe_issued': { 
      label: 'NFe Emitida', 
      bgClass: 'bg-[hsl(var(--status-nfe-issued))]',
      textClass: 'text-[hsl(var(--status-nfe-issued-foreground))]'
    },
    'contested': { 
      label: 'Contestada', 
      bgClass: 'bg-[hsl(var(--status-contested))]',
      textClass: 'text-[hsl(var(--status-contested-foreground))]'
    }
  };
  return statusOptions[status as keyof typeof statusOptions] || statusOptions['draft'];
};