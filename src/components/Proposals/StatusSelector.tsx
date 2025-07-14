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
    { value: 'draft', label: 'Rascunho', colorClass: 'bg-[hsl(var(--status-draft))]' },
    { value: 'sent', label: 'Enviada', colorClass: 'bg-[hsl(var(--status-sent))]' },
    { value: 'approved', label: 'Aprovada', colorClass: 'bg-[hsl(var(--status-approved))]' },
    { value: 'rejected', label: 'Rejeitada', colorClass: 'bg-[hsl(var(--status-rejected))]' },
    { value: 'expired', label: 'Expirada', colorClass: 'bg-[hsl(var(--status-expired))]' },
    { value: 'nfe_issued', label: 'NFe Emitida', colorClass: 'bg-[hsl(var(--status-nfe-issued))]' },
  ] as const;

  const currentOption = statusOptions.find(option => option.value === currentStatus) || statusOptions[0];

  return (
    <Select 
      value={currentStatus} 
      onValueChange={onStatusChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-auto min-w-[120px] text-xs h-8 px-3 gap-2 border-border bg-background hover:bg-accent transition-colors">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${currentOption.colorClass}`} />
          <SelectValue placeholder="Status" />
        </div>
      </SelectTrigger>
      <SelectContent className="z-50 bg-popover">
        {statusOptions.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className="cursor-pointer hover:bg-accent focus:bg-accent"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${option.colorClass}`} />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StatusSelector;