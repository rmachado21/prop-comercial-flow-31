import React from 'react';
import { Proposal } from '@/hooks/useProposals';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StatusSelectorProps {
  currentStatus: Proposal['status'];
  onStatusChange: (newStatus: Proposal['status']) => void;
  disabled?: boolean;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({ 
  currentStatus, 
  onStatusChange, 
  disabled = false 
}) => {
  const statusOptions = [
    { 
      value: 'draft', 
      label: 'Rascunho', 
      bgClass: 'bg-[hsl(var(--status-draft))]',
      textClass: 'text-[hsl(var(--status-draft-foreground))]'
    },
    { 
      value: 'sent', 
      label: 'Enviada', 
      bgClass: 'bg-[hsl(var(--status-sent))]',
      textClass: 'text-[hsl(var(--status-sent-foreground))]'
    },
    { 
      value: 'approved', 
      label: 'Aprovada', 
      bgClass: 'bg-[hsl(var(--status-approved))]',
      textClass: 'text-[hsl(var(--status-approved-foreground))]'
    },
    { 
      value: 'rejected', 
      label: 'Rejeitada', 
      bgClass: 'bg-[hsl(var(--status-rejected))]',
      textClass: 'text-[hsl(var(--status-rejected-foreground))]'
    },
    { 
      value: 'expired', 
      label: 'Expirada', 
      bgClass: 'bg-[hsl(var(--status-expired))]',
      textClass: 'text-[hsl(var(--status-expired-foreground))]'
    },
    { 
      value: 'nfe_issued', 
      label: 'NFe Emitida', 
      bgClass: 'bg-[hsl(var(--status-nfe-issued))]',
      textClass: 'text-[hsl(var(--status-nfe-issued-foreground))]'
    },
  ] as const;

  const currentOption = statusOptions.find(option => option.value === currentStatus) || statusOptions[0];

  return (
    <Select 
      value={currentStatus} 
      onValueChange={onStatusChange}
      disabled={disabled}
    >
      <SelectTrigger className={`
        w-auto min-w-[120px] text-xs h-8 px-3 gap-1 
        border-0 rounded-full font-medium
        ${currentOption.bgClass} ${currentOption.textClass}
        hover:opacity-80 transition-opacity
        disabled:opacity-50
      `}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent className="z-50 bg-popover">
        {statusOptions.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className="cursor-pointer hover:bg-accent focus:bg-accent"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${option.bgClass}`} />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StatusSelector;