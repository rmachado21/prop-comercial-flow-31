import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProposalPortalLinkProps {
  proposalId: string;
}

export const ProposalPortalLink: React.FC<ProposalPortalLinkProps> = ({ proposalId }) => {
  const { toast } = useToast();
  const [portalLink, setPortalLink] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generatePortalLink();
  }, [proposalId]);

  const generatePortalLink = async () => {
    setIsGenerating(true);
    try {
      // Check if a portal token already exists for this proposal
      const { data: existingToken, error: checkError } = await supabase
        .from('proposal_tokens')
        .select('token')
        .eq('proposal_id', proposalId)
        .eq('purpose', 'portal')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing token:', checkError);
      }

      let token = existingToken?.token;

      // If no valid token exists, create a new one
      if (!token) {
        const { data: tokenData, error: tokenError } = await supabase
          .from('proposal_tokens')
          .insert({
            proposal_id: proposalId,
            purpose: 'portal',
          })
          .select('token')
          .single();

        if (tokenError) {
          throw new Error(`Erro ao gerar token: ${tokenError.message}`);
        }

        token = tokenData.token;
      }

      const baseUrl = window.location.origin;
      const link = `${baseUrl}/proposta/${token}`;
      setPortalLink(link);
    } catch (error) {
      console.error('Error generating portal link:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar link do portal',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(portalLink);
      toast({
        title: 'Link Copiado',
        description: 'Link do portal copiado para a área de transferência',
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao copiar link',
        variant: 'destructive',
      });
    }
  };

  const openPortal = () => {
    if (portalLink) {
      window.open(portalLink, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portal da Proposta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Link de Compartilhamento</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Compartilhe este link para que o cliente possa visualizar, aprovar ou adicionar observações à proposta.
          </p>
          <div className="flex gap-2">
            <Input
              value={portalLink}
              readOnly
              placeholder={isGenerating ? 'Gerando link...' : 'Link não disponível'}
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={!portalLink || isGenerating}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openPortal}
              disabled={!portalLink || isGenerating}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generatePortalLink}
              disabled={isGenerating}
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p><strong>O que o cliente pode fazer no portal:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Visualizar todos os detalhes da proposta</li>
            <li>Aprovar ou rejeitar a proposta</li>
            <li>Adicionar observações e comentários</li>
            <li>Visualizar histórico de mudanças</li>
            <li>Imprimir a proposta em PDF</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};