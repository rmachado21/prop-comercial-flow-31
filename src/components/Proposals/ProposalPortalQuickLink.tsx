import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProposalPortalQuickLinkProps {
  proposalId: string;
  className?: string;
}

export const ProposalPortalQuickLink: React.FC<ProposalPortalQuickLinkProps> = ({ 
  proposalId, 
  className = '' 
}) => {
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
          console.error('Error generating token:', tokenError);
          return;
        }

        token = tokenData.token;
      }

      const baseUrl = window.location.origin;
      const link = `${baseUrl}/proposta/${token}`;
      setPortalLink(link);
    } catch (error) {
      console.error('Error generating portal link:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(portalLink);
      toast({
        title: 'Link copiado!',
        description: 'Link do portal copiado para área de transferência',
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link',
        variant: 'destructive',
      });
    }
  };

  const openPortal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (portalLink) {
      window.open(portalLink, '_blank');
    }
  };

  // Função para encurtar o link visualmente
  const getDisplayLink = () => {
    if (!portalLink) return '';
    const url = new URL(portalLink);
    const token = url.pathname.split('/').pop();
    return `.../${token?.substring(0, 8)}...`;
  };

  if (isGenerating || !portalLink) {
    return (
      <div className={`flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
        <LinkIcon className="w-3 h-3" />
        <span>Gerando...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-1 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-default">
              <LinkIcon className="w-3 h-3" />
              <span className="font-mono">{getDisplayLink()}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs break-all">{portalLink}</p>
          </TooltipContent>
        </Tooltip>
        
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copiar link</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={openPortal}
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Abrir portal</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};