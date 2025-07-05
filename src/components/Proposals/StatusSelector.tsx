import React from 'react';
import { Proposal } from '@/hooks/useProposals';

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
    { value: 'draft', label: 'Rascunho' },
    { value: 'sent', label: 'Enviada' },
    { value: 'approved', label: 'Aprovada' },
    { value: 'rejected', label: 'Rejeitada' },
    { value: 'expired', label: 'Expirada' },
    { value: 'nfe_issued', label: 'NFe Emitida' },
  ] as const;

  return (
    <select
      value={currentStatus}
      onChange={(e) => onStatusChange(e.target.value as Proposal['status'])}
      disabled={disabled}
      className="text-xs px-2 py-1 border border-commercial-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 bg-background disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default StatusSelector;