import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Send,
  Filter,
  Calendar,
  DollarSign,
  Printer,
  Mail
} from 'lucide-react';
import { useProposals, Proposal } from '@/hooks/useProposals';
import { useProposalItems } from '@/hooks/useProposalItems';
import { useProposalExport } from '@/hooks/useProposalExport';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import ProposalForm from '@/components/Proposals/ProposalForm';
import DeleteProposalDialog from '@/components/Proposals/DeleteProposalDialog';
import ProposalViewModal from '@/components/Proposals/ProposalViewModal';
import ProposalSendDialog from '@/components/Proposals/ProposalSendDialog';
import StatusSelector from '@/components/Proposals/StatusSelector';
import { useNavigate } from 'react-router-dom';

const Proposals: React.FC = () => {
  const navigate = useNavigate();
  const { proposals, isLoading, sendProposal, updateProposalStatus } = useProposals();
  const { exportToPDF } = useProposalExport();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [deleteProposal, setDeleteProposal] = useState<Proposal | null>(null);
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
  const [sendingProposal, setSendingProposal] = useState<Proposal | null>(null);

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = 
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.proposal_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', className: 'bg-gray-100 text-gray-800' },
      sent: { label: 'Enviada', className: 'bg-blue-100 text-blue-800' },
      approved: { label: 'Aprovada', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeitada', className: 'bg-red-100 text-red-800' },
      expired: { label: 'Expirada', className: 'bg-yellow-100 text-yellow-800' },
      nfe_issued: { label: 'NFe Emitida', className: 'bg-purple-100 text-purple-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

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

  const handleSend = async (proposal: Proposal) => {
    if (proposal.status === 'draft') {
      await sendProposal(proposal.id);
    }
  };

  const handleSendDialog = (proposal: Proposal) => {
    setSendingProposal(proposal);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-commercial-600">Total</p>
                  <p className="text-2xl font-bold text-commercial-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-commercial-600">Rascunhos</p>
                  <p className="text-2xl font-bold text-commercial-900">{stats.draft}</p>
                </div>
                <Edit className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-commercial-600">Enviadas</p>
                  <p className="text-2xl font-bold text-commercial-900">{stats.sent}</p>
                </div>
                <Send className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-commercial-600">Aprovadas</p>
                  <p className="text-2xl font-bold text-commercial-900">{stats.approved}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-commercial-600">NFe Emitida</p>
                  <p className="text-2xl font-bold text-commercial-900">{stats.nfe_issued}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-commercial-600">Valor Aprovado</p>
                  <p className="text-xl font-bold text-commercial-900">
                    R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-commercial-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por título, número ou cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-commercial-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-commercial-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Todos os Status</option>
                  <option value="draft">Rascunho</option>
                  <option value="sent">Enviada</option>
                  <option value="approved">Aprovada</option>
                  <option value="rejected">Rejeitada</option>
                  <option value="expired">Expirada</option>
                  <option value="nfe_issued">NFe Emitida</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposals List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-commercial-600">Carregando propostas...</p>
              </CardContent>
            </Card>
          ) : filteredProposals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-commercial-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-commercial-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta cadastrada'}
                </h3>
                <p className="text-commercial-600 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Comece criando sua primeira proposta comercial.'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button onClick={handleNewProposal} className="bg-gradient-primary hover:bg-primary-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Proposta
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredProposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-commercial-900">{proposal.title}</h3>
                            {getStatusBadge(proposal.status)}
                          </div>
                          <p className="text-sm text-commercial-600">
                            {proposal.proposal_number} • {proposal.client?.name}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-commercial-500">Criada em:</span>
                          <p className="font-medium">
                            {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <span className="text-commercial-500">Cliente:</span>
                          <p className="font-medium">{proposal.client?.name}</p>
                        </div>
                        <div>
                          <span className="text-commercial-500">Validade:</span>
                          <p className="font-medium">
                            {proposal.validity_days ? `${proposal.validity_days} dias` : 'Indefinida'}
                          </p>
                        </div>
                        <div>
                          <span className="text-commercial-500">Valor Total:</span>
                          <p className="font-bold text-lg text-commercial-900">
                            R$ {proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <StatusSelector
                        currentStatus={proposal.status}
                        onStatusChange={(newStatus) => updateProposalStatus(proposal.id, newStatus)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(proposal)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendDialog(proposal)}
                        title="Enviar Proposta"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDirectPDFExport(proposal)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      {proposal.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSend(proposal)}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(proposal)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteProposal(proposal)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

      <ProposalSendDialog
        proposal={sendingProposal}
        open={!!sendingProposal}
        onClose={() => setSendingProposal(null)}
      />
    </div>
  );
};

export default Proposals;
