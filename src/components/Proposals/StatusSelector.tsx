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
    { value: 'draft', label: 'Rascunho', color: 'hsl(var(--status-draft))', bgColor: 'hsl(var(--status-draft) / 0.1)' },
    { value: 'sent', label: 'Enviada', color: 'hsl(var(--status-sent))', bgColor: 'hsl(var(--status-sent) / 0.1)' },
    { value: 'approved', label: 'Aprovada', color: 'hsl(var(--status-approved))', bgColor: 'hsl(var(--status-approved) / 0.1)' },
    { value: 'rejected', label: 'Rejeitada', color: 'hsl(var(--status-rejected))', bgColor: 'hsl(var(--status-rejected) / 0.1)' },
    { value: 'expired', label: 'Expirada', color: 'hsl(var(--status-expired))', bgColor: 'hsl(var(--status-expired) / 0.1)' },
    { value: 'nfe_issued', label: 'NFe Emitida', color: 'hsl(var(--status-nfe-issued))', bgColor: 'hsl(var(--status-nfe-issued) / 0.1)' },
  ] as const;

  const currentOption = statusOptions.find(option => option.value === currentStatus) || statusOptions[0];

  return (
    <Select 
      value={currentStatus} 
      onValueChange={onStatusChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-auto text-xs h-8 px-3 gap-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: currentOption.color }}
          />
          <SelectValue placeholder="Status" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: option.color }}
              />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StatusSelector;