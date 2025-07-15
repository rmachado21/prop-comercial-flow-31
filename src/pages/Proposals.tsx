import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Grid, List } from 'lucide-react';
import { useProposals, Proposal } from '@/hooks/useProposals';
import { useProposalExport } from '@/hooks/useProposalExport';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import ProposalForm from '@/components/Proposals/ProposalForm';
import DeleteProposalDialog from '@/components/Proposals/DeleteProposalDialog';
import ProposalViewModal from '@/components/Proposals/ProposalViewModal';
import ProposalEmailDialog from '@/components/Proposals/ProposalEmailDialog';
import ProposalWhatsAppDialog from '@/components/Proposals/ProposalWhatsAppDialog';
import ProposalStats from '@/components/Proposals/ProposalStats';
import ProposalFilters from '@/components/Proposals/ProposalFilters';
import ProposalCard from '@/components/Proposals/ProposalCard';
import ProposalEmptyState from '@/components/Proposals/ProposalEmptyState';
import ProposalLoadingState from '@/components/Proposals/ProposalLoadingState';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const Proposals: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { proposals, isLoading, updateProposalStatus } = useProposals();
  const { exportToPDF } = useProposalExport();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [deleteProposal, setDeleteProposal] = useState<Proposal | null>(null);
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
  const [emailingProposal, setEmailingProposal] = useState<Proposal | null>(null);
  const [whatsappingProposal, setWhatsappingProposal] = useState<Proposal | null>(null);

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = 
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.proposal_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleView = (proposal: Proposal) => {
    setViewingProposal(proposal);
  };

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setShowForm(true);
  };

  const handleNewProposal = () => {
    setEditingProposal(null);
    setShowForm(true);
  };


  const handleEmailDialog = (proposal: Proposal) => {
    setEmailingProposal(proposal);
  };

  const handleWhatsAppDialog = (proposal: Proposal) => {
    setWhatsappingProposal(proposal);
  };

  const handleDirectPDFExport = async (proposal: Proposal) => {
    // Buscar itens da proposta
    const { data: items } = await supabase
      .from('proposal_items')
      .select('*')
      .eq('proposal_id', proposal.id)
      .order('sort_order', { ascending: true });

    // Gerar nome do arquivo personalizado
    const clientName = proposal.client?.name || 'Cliente';
    const nameWords = clientName.split(' ').filter(word => word.length > 0);
    const firstTwoNames = nameWords.slice(0, 2).join('-').toLowerCase()
      .replace(/[^a-z0-9-]/g, ''); // Remove caracteres especiais
    const currentDate = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
    const customFileName = `prop-${proposal.proposal_number}-${firstTwoNames}-${currentDate}`;

    // Exportar PDF com nome personalizado
    await exportToPDF(proposal, items || [], customFileName);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProposal(null);
  };

  const stats = {
    total: proposals.length,
    draft: proposals.filter(p => p.status === 'draft').length,
    sent: proposals.filter(p => p.status === 'sent').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    nfe_issued: proposals.filter(p => p.status === 'nfe_issued').length,
    totalValue: proposals
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + p.total_amount, 0),
  };

  if (showForm) {
    return (
      <ProposalForm 
        proposal={editingProposal} 
        onClose={handleFormClose}
      />
    );
  }

  const isFiltered = searchTerm !== '' || statusFilter !== 'all';

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-commercial-900">
              Sistema de Propostas
            </h1>
            <p className="text-commercial-600 mt-2">
              Gerencie suas propostas comerciais
            </p>
          </div>
          <Button onClick={handleNewProposal} className="bg-gradient-primary hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Proposta
          </Button>
        </div>

        {/* Stats Cards */}
        <ProposalStats stats={stats} isMobile={isMobile} />

        {/* Filters */}
        <ProposalFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          viewMode={viewMode}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onViewModeChange={setViewMode}
        />

        {/* Proposals List */}
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-2'
        }>
          {isLoading ? (
            <ProposalLoadingState />
          ) : filteredProposals.length === 0 ? (
            <ProposalEmptyState
              isFiltered={isFiltered}
              onNewProposal={handleNewProposal}
            />
          ) : (
            filteredProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                isMobile={isMobile}
                viewMode={viewMode}
                onView={handleView}
                onEdit={handleEdit}
                onEmail={handleEmailDialog}
                onWhatsApp={handleWhatsAppDialog}
                onExportPDF={handleDirectPDFExport}
                onStatusChange={updateProposalStatus}
              />
            ))
          )}
        </div>
      </div>

      {deleteProposal && (
        <DeleteProposalDialog
          proposal={deleteProposal}
          onClose={() => setDeleteProposal(null)}
        />
      )}

      <ProposalViewModal
        proposal={viewingProposal}
        open={!!viewingProposal}
        onClose={() => setViewingProposal(null)}
      />

      {emailingProposal && (
        <ProposalEmailDialog
          proposal={emailingProposal}
          open={!!emailingProposal}
          onClose={() => setEmailingProposal(null)}
        />
      )}

      {whatsappingProposal && (
        <ProposalWhatsAppDialog
          proposal={whatsappingProposal}
          open={!!whatsappingProposal}
          onClose={() => setWhatsappingProposal(null)}
        />
      )}
    </div>
  );
};

export default Proposals;
