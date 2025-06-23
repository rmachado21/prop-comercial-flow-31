
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Plus,
  Trash2,
  Package
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProposals, Proposal } from '@/hooks/useProposals';
import { useProposalItems } from '@/hooks/useProposalItems';
import { Navbar } from '@/components/Navbar';
import ClientSelector from '@/components/Proposals/ClientSelector';
import ProposalItemForm from '@/components/Proposals/ProposalItemForm';

const proposalSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  client_id: z.string().min(1, 'Cliente é obrigatório'),
  validity_days: z.number().min(1, 'Validade deve ser maior que 0').optional(),
  discount_percentage: z.number().min(0).max(100).optional(),
  tax_percentage: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  terms_and_conditions: z.string().optional(),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

interface ProposalFormProps {
  proposal?: Proposal | null;
  onClose: () => void;
}

const ProposalForm: React.FC<ProposalFormProps> = ({ proposal, onClose }) => {
  const { createProposal, updateProposal, sendProposal } = useProposals();
  const { items, addItem, updateItem, deleteItem } = useProposalItems(proposal?.id || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: proposal?.title || '',
      description: proposal?.description || '',
      client_id: proposal?.client_id || '',
      validity_days: proposal?.validity_days || 30,
      discount_percentage: proposal?.discount_percentage || 0,
      tax_percentage: proposal?.tax_percentage || 0,
      notes: proposal?.notes || '',
      terms_and_conditions: proposal?.terms_and_conditions || '',
    },
  });

  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const discountAmount = (subtotal * (form.watch('discount_percentage') || 0)) / 100;
  const taxAmount = ((subtotal - discountAmount) * (form.watch('tax_percentage') || 0)) / 100;
  const totalAmount = subtotal - discountAmount + taxAmount;

  const onSubmit = async (data: ProposalFormData) => {
    setIsSubmitting(true);
    try {
      const proposalData = {
        ...data,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        expiry_date: data.validity_days 
          ? new Date(Date.now() + data.validity_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : null,
      };

      if (proposal) {
        await updateProposal(proposal.id, proposalData);
      } else {
        await createProposal(proposalData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSend = async () => {
    if (proposal && proposal.status === 'draft') {
      setIsSubmitting(true);
      try {
        await sendProposal(proposal.id);
        onClose();
      } catch (error) {
        console.error('Error sending proposal:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setShowItemForm(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleCloseItemForm = () => {
    setShowItemForm(false);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-commercial-900">
              {proposal ? `Editar Proposta` : 'Nova Proposta'}
            </h1>
            {proposal && (
              <p className="text-commercial-600 mt-1">
                {proposal.proposal_number} • 
                <Badge className="ml-2">
                  {proposal.status === 'draft' ? 'Rascunho' : 
                   proposal.status === 'sent' ? 'Enviada' :
                   proposal.status === 'approved' ? 'Aprovada' :
                   proposal.status === 'rejected' ? 'Rejeitada' : 'Expirada'}
                </Badge>
              </p>
            )}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título da Proposta *</Label>
                    <Input
                      id="title"
                      {...form.register('title')}
                      placeholder="Ex: Proposta de Sistema de Gestão"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      {...form.register('description')}
                      placeholder="Descrição detalhada da proposta"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="client_id">Cliente *</Label>
                    <ClientSelector
                      value={form.watch('client_id')}
                      onChange={(value) => form.setValue('client_id', value)}
                    />
                    {form.formState.errors.client_id && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.client_id.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="validity_days">Validade (dias)</Label>
                      <Input
                        id="validity_days"
                        type="number"
                        {...form.register('validity_days', { valueAsNumber: true })}
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount_percentage">Desconto (%)</Label>
                      <Input
                        id="discount_percentage"
                        type="number"
                        step="0.01"
                        {...form.register('discount_percentage', { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax_percentage">Impostos (%)</Label>
                      <Input
                        id="tax_percentage"
                        type="number"
                        step="0.01"
                        {...form.register('tax_percentage', { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              {proposal && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Itens da Proposta</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddItem}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Item
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {items.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-commercial-400 mx-auto mb-4" />
                        <p className="text-commercial-600">Nenhum item adicionado</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddItem}
                          className="mt-4"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Primeiro Item
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {items.map((item, index) => (
                          <div key={item.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-commercial-900">
                                  {index + 1}. {item.product_name}
                                </h4>
                                {item.product_description && (
                                  <p className="text-sm text-commercial-600 mt-1">
                                    {item.product_description}
                                  </p>
                                )}
                                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                  <div>
                                    <span className="text-commercial-500">Quantidade:</span>
                                    <p className="font-medium">{item.quantity}</p>
                                  </div>
                                  <div>
                                    <span className="text-commercial-500">Preço Unit.:</span>
                                    <p className="font-medium">
                                      R$ {item.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-commercial-500">Total:</span>
                                    <p className="font-bold">
                                      R$ {item.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditItem(item)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteItem(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      {...form.register('notes')}
                      placeholder="Observações internas"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="terms_and_conditions">Termos e Condições</Label>
                    <Textarea
                      id="terms_and_conditions"
                      {...form.register('terms_and_conditions')}
                      placeholder="Termos e condições da proposta"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-commercial-600">Subtotal:</span>
                      <span className="font-medium">
                        R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    {form.watch('discount_percentage') > 0 && (
                      <div className="flex justify-between">
                        <span className="text-commercial-600">
                          Desconto ({form.watch('discount_percentage')}%):
                        </span>
                        <span className="font-medium text-red-600">
                          -R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    
                    {form.watch('tax_percentage') > 0 && (
                      <div className="flex justify-between">
                        <span className="text-commercial-600">
                          Impostos ({form.watch('tax_percentage')}%):
                        </span>
                        <span className="font-medium">
                          R$ {taxAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    
                    <hr />
                    <div className="flex justify-between">
                      <span className="font-semibold text-commercial-900">Total:</span>
                      <span className="font-bold text-xl text-commercial-900">
                        R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {proposal ? 'Atualizar' : 'Salvar'} Proposta
                    </Button>
                    
                    {proposal && proposal.status === 'draft' && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSend}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Proposta
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      {showItemForm && (
        <ProposalItemForm
          item={editingItem}
          onSave={editingItem ? updateItem : addItem}
          onClose={handleCloseItemForm}
        />
      )}
    </div>
  );
};

export default ProposalForm;
