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